import { IEmployee } from "../user/IUser";

export interface ISearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  sx?: object;
}

export interface ISelectedEmployeeChipsProps {
  employees: IEmployee[];
 onRemove: (employeeId: string) => void;
  title?: string;
  sx?: object;
}

export interface IEmployeeListItemProps {
  employee: IEmployee;
  isSelected: boolean;
  onToggle: (employee: IEmployee) => void;
}

export interface EmployeePickerProps {
  users: IEmployee[];
  selected: IEmployee[];
  onToggle: (employee: IEmployee) => void;
  onRemove: (employeeId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface IEmployeeListProps {
  employees: IEmployee[];
  selectedEmployees: IEmployee[];
  onEmployeeToggle: (employee: IEmployee) => void;
  title?: string;
  emptyMessage?: string;
  searchTerm?: string;
  maxHeight?: number | string;
}

export interface IEmployeeSectionProps {
  selectedEmployees: IEmployee[];
  onAddEmployeesClick: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  title?: string;
  emptyMessage?: string;
  height?: string | number;
}
