import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { BaseBtn } from '../../atoms';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import { useEditRequest } from '../../../hooks/editRequest/useEditRequest';
import { EditRequestResponse } from '../../../api/editRequest';
import dayjs from 'dayjs';
import RejectReasonDialog from '../dialog/RejectReasonDialog';
import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import StatusChip from '../../atoms/other/Icon/StatusChip';

interface EditRequestTableProps {
  statusFilter?: 'All' | 'Pending' | 'Approved' | 'Rejected';
  onStatusFilterChange?: (filter: 'All' | 'Pending' | 'Approved' | 'Rejected') => void;
}

const EditRequestTable: React.FC<EditRequestTableProps> = ({ 
  statusFilter = 'All',
  onStatusFilterChange
}) => {
  const { supervisedRequests, isLoading, error, loadSupervisedRequests, approve, reject, clearError } = useEditRequest();
  const [selectedRequest, setSelectedRequest] = useState<EditRequestResponse | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    loadSupervisedRequests({ status: statusFilter })
      .catch((err) => {
        console.error('EditRequestTable: Error loading requests:', err);
      });
  }, [statusFilter]);

  const handleStatusFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: 'All' | 'Pending' | 'Approved' | 'Rejected' | null) => {
    if (newFilter !== null && onStatusFilterChange) {
      onStatusFilterChange(newFilter);
    }
  };

  const handleApprove = async (request: EditRequestResponse) => {
    try {
      await approve(request._id);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectClick = (request: EditRequestResponse) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (selectedRequest) {
      try {
        await reject(selectedRequest._id, reason);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    }
  };

  // Define columns for DataTable
  const columns: DataTableColumn<EditRequestResponse>[] = [
    {
      key: 'employee',
      label: 'Employee',
      width: '20%',
      render: (request) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {request.userId?.firstName} {request.userId?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {request.userId?.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'month',
      label: 'Month',
      width: '15%',
      render: (request) => (
        <Typography variant="body2">
          {dayjs(request.month, 'YYYY-MM').format('MMMM YYYY')}
        </Typography>
      ),
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      width: '15%',
      render: (request) => (
        <Typography variant="body2">
          {dayjs(request.requestDate).format('MMM DD, YYYY')}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (request) => (
        <Box>
          <StatusChip status={request.status} />
          {request.status === 'Rejected' && request.rejectionReason && (
            <Typography variant="caption" display="block" color="error.main" sx={{ mt: 0.5 }}>
              {request.rejectionReason}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'processedBy',
      label: 'Processed By',
      width: '20%',
      render: (request) => {
        if (request.status === 'Approved' && request.approvedBy) {
          return (
            <Box>
              <Typography variant="body2">
                {request.approvedBy.firstName} {request.approvedBy.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(request.approvedDate).format('MMM DD, YYYY')}
              </Typography>
            </Box>
          );
        }
        if (request.status === 'Rejected' && request.rejectedBy) {
          return (
            <Box>
              <Typography variant="body2">
                {request.rejectedBy.firstName} {request.rejectedBy.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(request.rejectedDate).format('MMM DD, YYYY')}
              </Typography>
            </Box>
          );
        }
        return (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: (request) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {request.status === 'Pending' && (
            <>
              <BaseBtn
                size="small"
                variant="outlined"
                startIcon={<ThumbUpAltOutlinedIcon />}
                onClick={() => handleApprove(request)}
              >
                Approve
              </BaseBtn>
              <BaseBtn
                size="small"
                variant="outlined"
                startIcon={<ThumbDownAltOutlinedIcon />}
                onClick={() => handleRejectClick(request)}
              >
                Reject
              </BaseBtn>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        {error && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <BaseBtn
              onClick={() => {
                clearError();
                loadSupervisedRequests({ status: statusFilter });
              }}
            >
              Retry
            </BaseBtn>
          </Box>
        )}

        {!error && supervisedRequests.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {statusFilter === 'All'
                ? 'No edit requests from your team members yet'
                : `No ${statusFilter.toLowerCase()} edit requests`}
            </Typography>
          </Box>
        )}

        {!error && supervisedRequests.length > 0 && (
          <DataTable<EditRequestResponse>
            columns={columns}
            rows={supervisedRequests}
            getRowKey={(request) => request._id}
            size="small"
          />
        )}
      </Box>

      <RejectReasonDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleRejectConfirm}
        timesheetCount={1}
      />
    </>
  );
};

export default EditRequestTable;
