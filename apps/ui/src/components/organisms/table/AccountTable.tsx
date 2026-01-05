import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { IAccountTableRow } from '../../../interfaces/component/organism/ITable';
import DataTable from '../../templates/other/DataTable';
import { ContactNumberFormat } from '../../../utils';
import StatusChip from '../../atoms/other/Icon/StatusChip';
import ActionButton from '../../molecules/other/ActionButton';
import { IAccountTableProps } from '../../../interfaces/component/organism/ITable';
import { UserRole } from '@tms/shared';
import EmployeeCell from '../../molecules/account/EmployeeCell';

const AccountTable = ({ 
  rows, 
  onEditRow, 
  onDelete,
  onRowClick,
  disableEdit = false,
  showDelete = true,
  disableDelete = false
}: IAccountTableProps) => {
  
  const formatRole = (role: string | undefined): string => {
    if (!role) return '-';
    
    switch (role) {
      case UserRole.SuperAdmin:
        return 'Super Admin';
      case UserRole.Admin:
        return 'Admin';
      case UserRole.SupervisorAdmin:
        return 'Supervisor Admin';
      case UserRole.Supervisor:
        return 'Supervisor';
      case UserRole.Emp:
        return 'Employee';
      default:
        return role;
    }
  };

  const columns: DataTableColumn<IAccountTableRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { 
      label: 'Employee ID', 
      key: 'employee_id', 
      render: (row) => row.employee_id || '-' 
    },
    {
      label: 'Employee',
      key: 'employee',
      render: (row) => (
        <EmployeeCell
          name={`${row.firstName} ${row.lastName}`.trim()}
          email={row.email}
        />
      ),
    },
    {
      label: 'Designation',
      key: 'designation',
      render: (row) => row.designation || '-',
    },
    {
      label: 'Role',
      key: 'role',
      render: (row) => formatRole(row.role),
    },
    {
      label: 'Contact Number',
      key: 'contactNumber',
      render: (row) => ContactNumberFormat(row.contactNumber),
    },
    {
      label: 'Created On',
      key: 'createdAt',
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => (
        <StatusChip
          status={row.status === 'Active' ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      label: 'Action',
      key: 'action',
      render: (row) => (
        <span onClick={(e) => e.stopPropagation()}>
          <ActionButton
            onEdit={() => onEditRow?.(row)}
            onDelete={() => row.id && onDelete?.(row.id)}
            disableEdit={disableEdit}
            showDelete={showDelete}
            disableDelete={disableDelete}
            deleteLabel={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          />
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id ?? ''}
      onRowClick={(row) => {
        if (onRowClick) onRowClick(row);
      }}
      enableHover={true}
    />
  );
};

export default AccountTable;