import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { IAccountTableRow } from '../../../interfaces/component/organism/ITable';
import DataTable from '../../templates/other/DataTable';
import { ContactNumberFormat } from '../../../utils';
import StatusChip from '../../atoms/other/Icon/StatusChip';
import ActionButton from '../../molecules/other/ActionButton';
import { IAccountTableProps } from '../../../interfaces/component/organism/ITable';

const AccountTable = ({ 
  rows, 
  onEditRow, 
  onDelete,
  disableEdit = false,
  showDelete = true,
  disableDelete = false
}: IAccountTableProps) => {
  const columns: DataTableColumn<IAccountTableRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { 
      label: 'Employee ID', 
      key: 'employee_id', 
      render: (row) => row.employee_id || '-' 
    },
    { label: 'Email', key: 'email', render: (row) => row.email },
    {
      label: 'Name',
      key: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`.trim(),
    },
    {
      label: 'Role',
      key: 'role',
      render: (row) => row.role || '-',
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
        if (onEditRow) onEditRow(row);
      }}
    />
  );
};

export default AccountTable;