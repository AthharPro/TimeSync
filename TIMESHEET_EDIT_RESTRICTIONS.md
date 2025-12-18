# Timesheet Edit Restrictions - Draft Only

## Overview
Users can only edit timesheets that are in **Draft** status. Once a timesheet is submitted (Pending), approved (Approved), or rejected (Rejected), it cannot be modified by the user.

## Implementation

### Frontend - Table View (MyTimesheetTable.tsx)

**Disabled Fields for Non-Draft Timesheets:**
- ✅ Checkbox (cannot select non-Draft timesheets)
- ✅ Date picker
- ✅ Project dropdown
- ✅ Task dropdown
- ✅ Description field
- ✅ Hours field
- ✅ Billable type dropdown

**Code:**
```typescript
// All input fields check status before allowing edits
disabled={row.status !== DailyTimesheetStatus.Draft}
```

**Select All Behavior:**
- Only selects Draft timesheets
- Counts only Draft timesheets for "all selected" indicator
- Non-Draft timesheets are skipped during selection

### Frontend - Calendar View (MyTimesheetCalenderTable.tsx)

**Disabled Cells for Non-Draft Timesheets:**
- ✅ Hours field (disabled)
- ✅ Description button (disabled with tooltip)
- ✅ Tooltip shows "Cannot edit non-Draft timesheet"

**Code:**
```typescript
const isDraft = !timesheet?.status || 
                 timesheet.status === DailyTimesheetStatus.Draft || 
                 timesheet.status === '' || 
                 timesheet.status === 'Default';

<TimesheetCell
  hours={timesheet?.hours || 0}
  description={timesheet?.description || ''}
  disabled={!isDraft}
  status={timesheet?.status}
/>
```

### Backend - Service Layer (timesheet.service.ts)

**Update Validation:**
```typescript
// Only allow updating Draft timesheets
if (existingTimesheet.status !== 'Draft' && 
    existingTimesheet.status !== '' && 
    existingTimesheet.status !== 'Default') {
  throw new Error('Only Draft timesheets can be modified. This timesheet has status: ' + existingTimesheet.status);
}
```

**Benefits:**
- Server-side validation prevents bypass attempts
- Clear error messages to users
- Protects data integrity

**Delete Validation (already implemented):**
```typescript
// Only delete timesheets that are in draft status
status: { $in: ['', 'Default', 'Draft'] }
```

## Status Flow

```
Draft → User can edit ✅
  ↓ (Submit)
Pending → User CANNOT edit ❌
  ↓ (Approve)
Approved → User CANNOT edit ❌

Draft → User can edit ✅
  ↓ (Submit)
Pending → User CANNOT edit ❌
  ↓ (Reject)
Rejected → User CANNOT edit ❌
```

## User Experience

### Visual Indicators

**Table View:**
- 🔒 Disabled checkboxes (grayed out)
- 🔒 Disabled input fields (grayed out, not clickable)
- 🔒 Disabled dropdowns (not interactive)

**Calendar View:**
- 🔒 Disabled hours field (grayed out)
- 🔒 Disabled description button (grayed out)
- 💡 Tooltip: "Cannot edit non-Draft timesheet"

### Error Handling

**Frontend:**
- Fields are disabled - no interaction possible
- Clear visual feedback (grayed out appearance)

**Backend:**
- If somehow a request gets through: **400 Bad Request**
- Error message: "Only Draft timesheets can be modified. This timesheet has status: [status]"

## Testing Checklist

### Frontend - Table View
- [ ] Draft timesheets: All fields editable
- [ ] Pending timesheets: All fields disabled
- [ ] Approved timesheets: All fields disabled
- [ ] Rejected timesheets: All fields disabled
- [ ] Select All only selects Draft timesheets
- [ ] Checkbox disabled for non-Draft timesheets

### Frontend - Calendar View
- [ ] Draft timesheet cells: Hours and description editable
- [ ] Pending timesheet cells: Hours and description disabled
- [ ] Approved timesheet cells: Hours and description disabled
- [ ] Rejected timesheet cells: Hours and description disabled
- [ ] Tooltip shows correct message on disabled cells

### Backend
- [ ] Update API rejects non-Draft timesheet updates
- [ ] Error message is clear and informative
- [ ] Delete API only deletes Draft timesheets
- [ ] Status validation works for all non-Draft states

## Edge Cases Handled

1. **Empty/Default Status:**
   - Treated as Draft (allowed to edit)
   - Handles legacy data without explicit "Draft" status

2. **Multiple Statuses:**
   - Checks for: '', 'Default', 'Draft' as editable
   - All other statuses blocked

3. **Backend Bypass Prevention:**
   - Server-side validation ensures security
   - Even if frontend is bypassed, backend rejects

4. **Selection Edge Cases:**
   - Select All ignores non-Draft timesheets
   - Indeterminate state calculated correctly
   - Only Draft count used for "all selected" check

## Benefits

### Data Integrity
- ✅ Prevents accidental modification of submitted timesheets
- ✅ Protects approved/rejected timesheet records
- ✅ Maintains audit trail

### User Experience
- ✅ Clear visual indicators
- ✅ Prevents user errors
- ✅ Consistent behavior across table and calendar views

### Security
- ✅ Backend validation prevents bypass
- ✅ Double protection (frontend + backend)
- ✅ Clear error messages

## Future Enhancements

1. **Rejected Timesheet Handling:**
   - Option to "copy" rejected timesheet to create new Draft
   - Shows rejection reason in tooltip
   - Allows user to fix and resubmit

2. **Admin Override:**
   - Allow admins to edit non-Draft timesheets (if needed)
   - Requires special permission
   - Logs all admin edits

3. **Bulk Recall:**
   - Allow users to recall Pending timesheets back to Draft
   - Before supervisor approval only
   - Limited time window (e.g., 24 hours)

## Related Files

**Frontend:**
- `/apps/ui/src/components/organisms/table/MyTimesheetTable.tsx` - Table view with disabled fields
- `/apps/ui/src/components/organisms/table/MyTimesheetCalenderTable.tsx` - Calendar view with disabled cells
- `/apps/ui/src/components/organisms/table/other/TimesheetCell.tsx` - Cell component with disabled support
- `/apps/ui/src/interfaces/component/organism/ITable.tsx` - Updated TimesheetCellProps interface

**Backend:**
- `/apps/api/src/services/timesheet.service.ts` - Update and delete validation

**Shared:**
- `@tms/shared` - DailyTimesheetStatus enum

## Summary

The edit restriction feature ensures:
- ✅ **Draft timesheets** → Fully editable
- ❌ **Pending timesheets** → Cannot be edited
- ❌ **Approved timesheets** → Cannot be edited
- ❌ **Rejected timesheets** → Cannot be edited

This protects the integrity of the timesheet workflow and prevents accidental modifications of timesheets that are under review or have been processed.
