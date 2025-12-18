# TimesheetRejection Model - Quick Reference

## Overview
The `TimesheetRejection` model is a separate collection for storing timesheet rejection reasons and history. This architecture separates rejection data from the main timesheet records for better data management.

## Model Schema

### Collection Name
`timesheetrejections`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timesheetId` | ObjectId | Yes | Reference to the rejected Timesheet |
| `rejectedBy` | ObjectId | Yes | Reference to the User (supervisor) who rejected |
| `rejectionReason` | String | Yes | The reason for rejection (min 10 chars) |
| `rejectedAt` | Date | Yes | When the rejection occurred (default: now) |
| `createdAt` | Date | Auto | MongoDB timestamp |
| `updatedAt` | Date | Auto | MongoDB timestamp |

### Indexes
- Compound index: `{ timesheetId: 1, rejectedAt: -1 }` - For querying rejection history
- Single index: `timesheetId` - For fast lookups

## Benefits

### 1. Rejection History
A timesheet can be rejected multiple times (Draft → Pending → Rejected → Draft → Pending → Rejected). Each rejection is stored as a separate record.

```javascript
// Example: Timesheet rejected twice
[
  {
    timesheetId: "673abc...",
    rejectedBy: "672def...",
    rejectionReason: "Incorrect hours logged",
    rejectedAt: "2025-12-15T10:00:00Z"
  },
  {
    timesheetId: "673abc...",
    rejectedBy: "672def...",
    rejectionReason: "Missing task description",
    rejectedAt: "2025-12-18T14:30:00Z"
  }
]
```

### 2. Audit Trail
Track who rejected which timesheets and when:
- Employee can see rejection history
- Managers can analyze rejection patterns
- Compliance and reporting requirements met

### 3. Data Normalization
Keeps the Timesheet model clean and focused:
- Timesheet stores only the latest status and dates
- TimesheetRejection stores detailed rejection information
- Easier to maintain and query

### 4. Query Flexibility
Easy to get rejection statistics:
```typescript
// Find all rejections by a supervisor
await TimesheetRejection.find({ rejectedBy: supervisorId })

// Find rejection patterns for an employee
await TimesheetRejection.find({ timesheetId: { $in: employeeTimesheetIds } })

// Get most common rejection reasons
await TimesheetRejection.aggregate([
  { $group: { _id: "$rejectionReason", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## Usage Examples

### Creating a Rejection Record
```typescript
const rejectionRecord = await TimesheetRejection.create({
  timesheetId: timesheetId,
  rejectedBy: supervisorId,
  rejectionReason: "Hours exceed daily limit",
  rejectedAt: new Date()
});
```

### Batch Creating Rejection Records
```typescript
const rejectionRecords = timesheetIds.map(id => ({
  timesheetId: new mongoose.Types.ObjectId(id),
  rejectedBy: new mongoose.Types.ObjectId(supervisorId),
  rejectionReason: reason.trim(),
  rejectedAt: new Date()
}));

await TimesheetRejection.insertMany(rejectionRecords);
```

### Getting Latest Rejection Reason
```typescript
const latestRejection = await TimesheetRejection
  .findOne({ timesheetId })
  .sort({ rejectedAt: -1 })
  .populate('rejectedBy', 'firstName lastName')
  .lean();
```

### Getting All Rejection Reasons for Multiple Timesheets
```typescript
const rejections = await TimesheetRejection.find({
  timesheetId: { $in: timesheetIds }
})
  .populate('rejectedBy', 'firstName lastName')
  .sort({ rejectedAt: -1 })
  .lean();

// Create a map for easy lookup
const rejectionMap = new Map();
rejections.forEach(record => {
  const tsId = record.timesheetId.toString();
  if (!rejectionMap.has(tsId)) {
    rejectionMap.set(tsId, record); // Store latest (first due to sort)
  }
});
```

## API Integration

### In Review Controller
When fetching timesheets, the controller automatically includes rejection reasons:

```typescript
// 1. Fetch timesheets
const timesheets = await Timesheet.find(query).lean();

// 2. Get rejection records
const timesheetIds = timesheets.map(ts => ts._id);
const rejectionRecords = await TimesheetRejection.find({
  timesheetId: { $in: timesheetIds }
})
  .populate('rejectedBy', 'firstName lastName')
  .sort({ rejectedAt: -1 })
  .lean();

// 3. Map rejections to timesheets
const rejectionMap = new Map();
rejectionRecords.forEach(record => {
  const id = record.timesheetId.toString();
  if (!rejectionMap.has(id)) {
    rejectionMap.set(id, record);
  }
});

// 4. Add rejection data to timesheets
const timesheetsWithRejections = timesheets.map(ts => ({
  ...ts,
  rejectionReason: rejectionMap.get(ts._id.toString())?.rejectionReason,
  rejectedBy: rejectionMap.get(ts._id.toString())?.rejectedBy,
  rejectedAt: rejectionMap.get(ts._id.toString())?.rejectedAt
}));
```

### When Rejecting Timesheets
```typescript
// 1. Update timesheet status
await Timesheet.updateMany(
  { _id: { $in: timesheetIds }, status: 'Pending' },
  { $set: { status: 'Rejected', rejectionDate: new Date() } }
);

// 2. Create rejection records
const rejectionRecords = timesheetIds.map(id => ({
  timesheetId: new mongoose.Types.ObjectId(id),
  rejectedBy: new mongoose.Types.ObjectId(supervisorId),
  rejectionReason: reason.trim(),
  rejectedAt: new Date()
}));

await TimesheetRejection.insertMany(rejectionRecords);
```

## Frontend Usage

When displaying timesheets, rejection data is included:

```typescript
interface TimesheetWithRejection {
  _id: string;
  // ... other timesheet fields
  status: string;
  rejectionDate?: Date;
  rejectionReason?: string;
  rejectedBy?: {
    firstName: string;
    lastName: string;
  };
  rejectedAt?: Date;
}
```

Display example:
```tsx
{timesheet.status === 'Rejected' && (
  <Tooltip title={`Rejected by ${timesheet.rejectedBy?.firstName} ${timesheet.rejectedBy?.lastName} on ${new Date(timesheet.rejectedAt).toLocaleDateString()}`}>
    <Typography color="error">
      {timesheet.rejectionReason}
    </Typography>
  </Tooltip>
)}
```

## Database Considerations

### Storage
- Small records (~200-500 bytes each)
- Indexed for fast queries
- Automatically cleaned up if needed (e.g., delete rejections older than 2 years)

### Performance
- Fast lookups using timesheetId index
- Efficient batch queries with `$in` operator
- Sorted results for getting latest rejection

### Data Integrity
- References validated via MongoDB
- Cascade delete option if timesheet is deleted (optional)
- Required fields ensure data quality

## Maintenance

### Cleanup Old Rejections (Optional)
```typescript
// Delete rejections older than 2 years
await TimesheetRejection.deleteMany({
  rejectedAt: { $lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) }
});
```

### Migration from Old Model (If Needed)
If you previously stored rejectionReason in Timesheet:
```typescript
const timesheets = await Timesheet.find({ rejectionReason: { $exists: true } });

const rejectionRecords = timesheets.map(ts => ({
  timesheetId: ts._id,
  rejectedBy: ts.rejectedBy || null, // May need to set a default
  rejectionReason: ts.rejectionReason,
  rejectedAt: ts.rejectionDate || ts.updatedAt
}));

await TimesheetRejection.insertMany(rejectionRecords);

// Then remove from Timesheet
await Timesheet.updateMany(
  { rejectionReason: { $exists: true } },
  { $unset: { rejectionReason: "" } }
);
```

## Future Enhancements

1. **Rejection Categories**
   - Add `rejectionCategory` field (e.g., "Hours", "Description", "Billing")
   - Helps analyze common issues

2. **Rejection Templates**
   - Store common rejection reasons
   - Quick selection for supervisors

3. **Employee Responses**
   - Allow employees to respond to rejections
   - Track timesheet corrections

4. **Analytics Dashboard**
   - Rejection rate by employee/supervisor
   - Most common rejection reasons
   - Trends over time

## Related Models

- **Timesheet** - Main timesheet record (status, dates, hours)
- **User** - Employee and supervisor information
- **Project** - Project reference
- **Task** - Task reference

## Summary

The `TimesheetRejection` model provides:
- ✅ Clean separation of concerns
- ✅ Complete rejection history
- ✅ Audit trail compliance
- ✅ Flexible querying
- ✅ Scalable architecture
- ✅ Easy reporting and analytics

This design allows for comprehensive timesheet management while maintaining clean, normalized data structures.
