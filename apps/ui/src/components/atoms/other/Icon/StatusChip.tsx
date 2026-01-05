import { Chip } from "@mui/material";
import { IStatusChipProps } from "../../../../interfaces/component/atom/IStatusChipProps";

const StatusChip: React.FC<IStatusChipProps> = ({ status }) => {
  const colorMap: Record<string, { 
    bgcolor: string; 
    color: string; 
    label: string 
  }> = {
    // Account/Project statuses
    InActive: { 
      bgcolor: "#ffebee", // Very light red
      color: "#c62828", // Dark red
      label: "Inactive" 
    },
    Inactive: { 
      bgcolor: "#ffebee", // Very light red
      color: "#c62828", // Dark red
      label: "Inactive" 
    },
    Active: { 
      bgcolor: "#e8f5e9", // Very light green
      color: "#2e7d32", // Dark green
      label: "Active" 
    },
    Completed: { 
      bgcolor: "#e3f2fd", // Very light blue
      color: "#1565c0", // Dark blue
      label: "Completed" 
    },
    "On Hold": { 
      bgcolor: "#fff3e0", // Very light orange
      color: "#e65100", // Dark orange
      label: "On Hold" 
    },
    // Timesheet statuses
    Draft: { 
      bgcolor: "#f5f5f5", // Very light grey
      color: "#424242", // Dark grey
      label: "Draft" 
    },
    Pending: { 
      bgcolor: "#fff8e1", // Very light yellow/orange
      color: "#f57c00", // Dark orange
      label: "Pending" 
    },
    Approved: { 
      bgcolor: "#e8f5e9", // Very light green
      color: "#2e7d32", // Dark green
      label: "Approved" 
    },
    Rejected: { 
      bgcolor: "#ffebee", // Very light red
      color: "#c62828", // Dark red
      label: "Rejected" 
    },
  };

  const chipData = colorMap[status] || { 
    bgcolor: "#f5f5f5", // Very light grey for unknown
    color: "#424242", // Dark grey for unknown
    label: String(status || "Unknown") 
  };

  return (
    <Chip
      label={chipData.label}
      size="small"
      sx={{
        bgcolor: chipData.bgcolor,
        color: chipData.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: 'none',
        '& .MuiChip-label': {
          px: 1.5,
        },
      }}
    />
  );
};

export default StatusChip;