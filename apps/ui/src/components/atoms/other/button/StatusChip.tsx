import { Chip } from "@mui/material";
import { IStatusChipProps } from "../../../../interfaces/component";

const StatusChip: React.FC<IStatusChipProps> = ({ status }) => {
  const colorMap: Record<string, { color: "error" | "success"; label: string }> = {
    InActive: { color: "error", label: "In" },
    Active: { color: "success", label: "Active" },
  };

  const chipData = colorMap[status] || { color: "default", label: String(status || "Unknown") };

  return (
    <Chip
      label={chipData.label}
      color={chipData.color as "default" | "error" | "success"}
      size="small"
    />
  );
};

export default StatusChip;