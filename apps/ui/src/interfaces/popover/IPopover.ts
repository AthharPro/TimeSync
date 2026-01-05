export interface AccountFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { role: string; status: string }) => void;
}

export interface ProjectFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { projectType: string; status: string; billable: string; visibility: string; costCenter: string }) => void;
}

export interface TeamFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { supervisor: string; status: string }) => void;
}