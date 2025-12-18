# Review Timesheet - Approve & Reject Feature

## Overview
This document describes the approve and reject functionality for the Review Timesheet feature. Supervisors can approve or reject timesheets submitted by their supervised employees, with rejection requiring a mandatory reason.

## Features

### 1. Approve Timesheets
- Supervisors can select one or more **Pending** timesheets and approve them
- Only timesheets with status "Pending" can be approved
- Approved timesheets change status from "Pending" to "Approved"
- Approval date is automatically recorded
- Confirmation dialog before approving

### 2. Reject Timesheets
- Supervisors can select one or more **Pending** timesheets and reject them
- Only timesheets with status "Pending" can be rejected
- Rejection **requires a mandatory reason** (minimum 10 characters)
- Rejected timesheets change status from "Pending" to "Rejected"
- Rejection date and reason are automatically recorded
- Modal dialog for entering rejection reason

### 3. Selection Rules
- Only **Pending** timesheets can be selected (Draft, Approved, and Rejected are disabled)
- Checkboxes are disabled for non-Pending timesheets
- "Select All" only selects Pending timesheets
- Selected timesheets are tracked per employee

## Backend Implementation

### New API Endpoints

#### 1. Approve Timesheets
```
POST /api/review/timesheets/approve
```

**Request Body:**
```json
{
  "timesheetIds": ["timesheetId1", "timesheetId2", ...]
}
```

**Response:**
```json
{
  "message": "Timesheets approved successfully",
  "approved": 2
}
```

**Validation:**
- Only supervisors can approve (Supervisor, SupervisorAdmin, Admin, SuperAdmin roles)
- Supervisor must have permission to approve those employees' timesheets
- All timesheets must be in "Pending" status
- Returns error if any timesheet is not in "Pending" status

#### 2. Reject Timesheets
```
POST /api/review/timesheets/reject
```

**Request Body:**
```json
{
  "timesheetIds": ["timesheetId1", "timesheetId2", ...],
  "rejectionReason": "Reason for rejection (min 10 chars)"
}
```

**Response:**
```json
{
  "message": "Timesheets rejected successfully",
  "rejected": 2
}
```

**Validation:**
- Only supervisors can reject (Supervisor, SupervisorAdmin, Admin, SuperAdmin roles)
- Supervisor must have permission to reject those employees' timesheets
- All timesheets must be in "Pending" status
- Rejection reason is **mandatory** and must be non-empty
- Returns error if any timesheet is not in "Pending" status

### Database Changes

**New Model: TimesheetRejection**

A separate collection to store rejection reasons and history:

```typescript
{
  timesheetId: ObjectId (reference to Timesheet),
  rejectedBy: ObjectId (reference to User - the supervisor who rejected),
  rejectionReason: string (required),
  rejectedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

**Benefits of separate model:**
- ✅ Maintains rejection history (multiple rejections per timesheet)
- ✅ Tracks who rejected the timesheet
- ✅ Cleaner timesheet model
- ✅ Easy to query rejection reasons separately
- ✅ Supports audit trail

**Timesheet Model Updates:**
```typescript
{
  // ... existing fields
  approvalDate: Date (optional),
  approvedBy: ObjectId (reference to User - the supervisor who approved),
  rejectionDate: Date (optional),
  // Note: rejectionReason is stored in TimesheetRejection model
}
```

### Backend Files Modified/Created

1. **`/apps/api/src/controllers/review.controller.ts`**
   - Added `approveTimesheetsHandler` - Handles approve requests, sets approvedBy
   - Added `rejectTimesheetsHandler` - Handles reject requests, creates rejection records in TimesheetRejection collection
   - Updated `getEmployeeTimesheetsForReviewHandler` - Fetches and includes rejection reasons from TimesheetRejection

2. **`/apps/api/src/routes/review.route.ts`**
   - Added `POST /timesheets/approve` route
   - Added `POST /timesheets/reject` route

3. **`/apps/api/src/models/rejectionReason.model.ts`** (NEW)
   - Created TimesheetRejection model for storing rejection reasons
   - Includes timesheetId, rejectedBy, rejectionReason, rejectedAt

4. **`/apps/api/src/interfaces/rejectionReason.ts`** (NEW)
   - Created ITimesheetRejection interface

5. **`/apps/api/src/models/timesheet.model.ts`**
   - Added `approvalDate`, `approvedBy`, `rejectionDate` fields
   - Does NOT store rejectionReason (stored in separate collection)

6. **`/apps/api/src/interfaces/timesheet.ts`**
   - Updated `ITimesheet` interface with new fields

7. **`/apps/api/src/models/index.ts`**
   - Exported TimesheetRejection model

8. **`/apps/api/src/interfaces/index.ts`**
   - Exported ITimesheetRejection interface

## Frontend Implementation

### Redux State Management

**New Async Thunks:**
```typescript
// Approve timesheets
approveTimesheetsThunk({ employeeId, timesheetIds })

// Reject timesheets
rejectTimesheetsThunk({ employeeId, timesheetIds, rejectionReason })
```

**State Updates:**
- On approve: Updates timesheet status to "Approved" in Redux store
- On reject: Updates timesheet status to "Rejected" in Redux store
- Optimistic UI updates for better user experience

### Custom Hook Updates

**`useReviewTimesheet` Hook - New Functions:**
```typescript
// Approve selected timesheets
approveSelectedTimesheets(employeeId: string, timesheetIds: string[]): Promise<any>

// Reject selected timesheets
rejectSelectedTimesheets(employeeId: string, timesheetIds: string[], rejectionReason: string): Promise<any>
```

### UI Components

#### 1. ReviewTimesheetWindow
**File:** `/apps/ui/src/components/organisms/window/ReviewTimesheetWindow.tsx`

**Features:**
- Approve and Reject buttons in header
- Buttons are disabled when no timesheets are selected
- Shows success/error alerts after approve/reject operations
- Manages reject reason dialog state

**User Flow:**
1. User clicks on employee row to expand timesheets
2. User selects one or more Pending timesheets (checkboxes)
3. User clicks "Approve" or "Reject" button
4. For Approve: Confirmation dialog → API call → Success message
5. For Reject: Rejection reason dialog → API call → Success message

#### 2. EmpTimesheetTable
**File:** `/apps/ui/src/components/organisms/table/EmpTimesheetTable.tsx`

**Features:**
- Checkboxes for selecting timesheets
- Only Pending timesheets can be selected (disabled for others)
- "Select All" checkbox (only selects Pending timesheets)
- Notifies parent component of selection changes
- Filters selections to only include Pending timesheets

#### 3. RejectReasonDialog (NEW)
**File:** `/apps/ui/src/components/organisms/dialog/RejectReasonDialog.tsx`

**Features:**
- Modal dialog for entering rejection reason
- Text area with minimum 10 characters validation
- Character counter to help user meet minimum requirement
- Real-time validation feedback
- Cancel and Reject buttons
- Reject button disabled until valid reason is entered

**Validation:**
- Rejection reason is required
- Minimum 10 characters
- Whitespace-only input is not allowed

#### 4. ReviewTimesheetTable
**File:** `/apps/ui/src/components/organisms/table/ReviewTimesheetTable.tsx`

**Features:**
- Tracks selected timesheets per employee
- Passes selection changes to parent component
- Maintains selection state when employee rows are collapsed/expanded

### API Client

**New Functions in `/apps/ui/src/api/review.ts`:**
```typescript
// Approve timesheets
approveTimesheets(timesheetIds: string[]): Promise<{ message: string; approved: number }>

// Reject timesheets
rejectTimesheets(timesheetIds: string[], rejectionReason: string): Promise<{ message: string; rejected: number }>
```

## User Workflows

### Approve Workflow
1. Supervisor opens Review Timesheet window
2. Clicks on employee row to view their timesheets
3. Selects one or more **Pending** timesheets using checkboxes
4. Clicks "Approve" button in header
5. Confirms in confirmation dialog
6. System approves selected timesheets
7. Success message shows number of approved timesheets
8. Timesheet statuses update to "Approved" in the UI
9. Approved timesheets become unselectable (checkboxes disabled)

### Reject Workflow
1. Supervisor opens Review Timesheet window
2. Clicks on employee row to view their timesheets
3. Selects one or more **Pending** timesheets using checkboxes
4. Clicks "Reject" button in header
5. Rejection reason dialog appears
6. Supervisor enters rejection reason (minimum 10 characters)
7. Clicks "Reject" button in dialog
8. System rejects selected timesheets with the provided reason
9. Success message shows number of rejected timesheets
10. Timesheet statuses update to "Rejected" in the UI
11. Rejected timesheets become unselectable (checkboxes disabled)

## Permission Control

### Role-based Access
- **Supervisor:** Can approve/reject timesheets for employees in their supervised projects/teams
- **SupervisorAdmin:** Can approve/reject timesheets for employees in their supervised projects/teams
- **Admin:** Can approve/reject all employee timesheets
- **SuperAdmin:** Can approve/reject all employee timesheets

### Validation Rules
1. User must be authenticated
2. User must have supervisor role or higher
3. For regular supervisors: Must be supervising the employee (via project or team assignment)
4. For admins: Can approve/reject any employee's timesheets
5. Timesheets must be in "Pending" status

## Error Handling

### Backend Errors
- **400 Bad Request:** Missing/invalid parameters
- **403 Forbidden:** No permission to approve/reject
- **404 Not Found:** Timesheets not found
- **500 Internal Server Error:** Server error

### Frontend Error Messages
- "Please select at least one timesheet to approve/reject."
- "No employee selected."
- "Only timesheets in Pending status can be approved/rejected"
- "Rejection reason is required"
- "Rejection reason must be at least 10 characters"
- "Failed to approve/reject timesheets: [error message]"

## Data Flow

### Approve Flow
```
User selects Pending timesheets
  ↓
User clicks Approve button
  ↓
Confirmation dialog
  ↓
POST /api/review/timesheets/approve
  ↓
Backend validates permissions & status
  ↓
Updates timesheets (status → Approved, approvalDate → now, approvedBy → supervisorId)
  ↓
Returns success response
  ↓
Redux state updated (status → Approved)
  ↓
UI updates (checkboxes disabled, status displayed)
```

### Reject Flow
```
User selects Pending timesheets
  ↓
User clicks Reject button
  ↓
Rejection reason dialog opens
  ↓
User enters reason (min 10 chars)
  ↓
User clicks Reject in dialog
  ↓
POST /api/review/timesheets/reject
  ↓
Backend validates permissions, status & reason
  ↓
Updates timesheets (status → Rejected, rejectionDate → now)
  ↓
Creates rejection records in TimesheetRejection collection
  (timesheetId, rejectedBy, rejectionReason, rejectedAt)
  ↓
Returns success response
  ↓
Redux state updated (status → Rejected)
  ↓
UI updates (checkboxes disabled, status displayed)
```

## Testing Checklist

### Backend Testing
- [ ] Approve endpoint validates user role
- [ ] Approve endpoint checks supervisor permissions
- [ ] Approve endpoint only approves Pending timesheets
- [ ] Approve endpoint sets approvalDate correctly
- [ ] Reject endpoint validates user role
- [ ] Reject endpoint checks supervisor permissions
- [ ] Reject endpoint only rejects Pending timesheets
- [ ] Reject endpoint requires rejection reason
- [ ] Reject endpoint sets rejectionDate and rejectionReason correctly
- [ ] Error responses for invalid/non-Pending timesheets

### Frontend Testing
- [ ] Only Pending timesheets can be selected
- [ ] Approve button disabled when no selection
- [ ] Reject button disabled when no selection
- [ ] Approve confirmation dialog works
- [ ] Reject reason dialog opens correctly
- [ ] Reject reason validation (min 10 chars) works
- [ ] Success messages display correctly
- [ ] Error messages display correctly
- [ ] UI updates after approve/reject
- [ ] Checkboxes disabled for non-Pending timesheets
- [ ] Select All only selects Pending timesheets

### Integration Testing
- [ ] End-to-end approve flow works
- [ ] End-to-end reject flow works
- [ ] Multiple employees' timesheets handled correctly
- [ ] Selection persists during expand/collapse
- [ ] Redux state updates correctly
- [ ] Network errors handled gracefully

## Future Enhancements

1. **Bulk Operations**
   - Select timesheets across multiple employees
   - Approve/reject all pending timesheets for a week

2. **Notification System**
   - Email employees when timesheets are approved/rejected
   - In-app notifications for status changes

3. **Audit Trail**
   - Track who approved/rejected each timesheet
   - Show approval/rejection history

4. **Comments/Notes**
   - Allow supervisors to add notes during approval
   - Show notes in timesheet history

5. **Undo Functionality**
   - Allow reverting approved/rejected timesheets back to Pending
   - Only for recent actions (e.g., within 24 hours)

## Summary

The approve and reject functionality provides supervisors with complete control over timesheet review. The implementation ensures:
- ✅ Only Pending timesheets can be approved/rejected
- ✅ Rejection requires a mandatory reason (stored in separate TimesheetRejection model)
- ✅ Rejection history maintained (multiple rejections tracked)
- ✅ Tracks who approved/rejected (approvedBy, rejectedBy fields)
- ✅ Permission validation at both frontend and backend
- ✅ Real-time UI updates via Redux
- ✅ Clear user feedback through alerts and dialogs
- ✅ Consistent state management across components
- ✅ Robust error handling
- ✅ Clean data architecture with separate rejection reasons collection

**Key Architecture Decision:**
Rejection reasons are stored in a separate `TimesheetRejection` collection rather than directly in the `Timesheet` model. This provides:
- Better data normalization
- Rejection history tracking (can see all past rejections)
- Cleaner timesheet model
- Easier to query and report on rejection patterns
- Scalability for future audit features

This feature completes the timesheet review workflow, allowing supervisors to efficiently manage employee time tracking submissions.

