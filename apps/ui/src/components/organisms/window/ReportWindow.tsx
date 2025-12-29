import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ReportLayout from '../../templates/report/ReportLayout';
import { IReportWindowProps } from '../../../interfaces/report/IReport';
import { ReportFilter as ReportFilterComponent } from '../report/ReportFilter';
import { Box, CircularProgress } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useState, useEffect } from 'react';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import { HelperText } from '../../atoms';
import { useReportFilters } from '../../../hooks/report/useReportFilters';
import { useReportGenerator } from '../../../hooks/report/useReportGenerator';
import { useReportPreview } from '../../../hooks/report/useReportPreview';
import ReportGroupedPreview from '../report/ReportGroupedPreview';
import { useReportType } from '../../../hooks/report/useReportType';

function ReportWindow({ onReset }: IReportWindowProps) {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [tabValue, setTabValue] = useState('1');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { currentFilter, handleFilterChange, resetFilters, isFilterValid } = useReportFilters();
  const { reportType, setReportType } = useReportType();
  
  const {
    isGenerating,
    generateDetailedReport,
    generateTimesheetEntries,
    error: generatorError,
    clearError
  } = useReportGenerator({
    onSuccess: (filename) => {
      console.log('Report generated successfully:', filename);
    },
    onError: (error) => {
      console.error('Report generation failed:', error);
    }
  });

  const {
    groupedPreviewData,
    isLoadingPreview,
    previewError
  } = useReportPreview({
    reportType: reportType || '',
    filter: currentFilter,
    isFilterValid
  });

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
    clearError();
    resetFilters();
    onReset?.();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    // Update report type when tab changes
    setReportType(newValue === '1' ? 'detailed-timesheet' : 'timesheet-entries');
    clearError();
  };

  // Set initial report type
  useEffect(() => {
    setReportType('detailed-timesheet');
  }, []);

  const handleGenerateReport = () => {
    if (!isFilterValid) {
      return;
    }
    setDialogOpen(true);
  };

  const handlePDFExport = async () => {
    setDialogOpen(false);
    try {
      if (reportType === 'detailed-timesheet') {
        await generateDetailedReport(currentFilter, 'pdf');
      } else if (reportType === 'timesheet-entries') {
        await generateTimesheetEntries(currentFilter, 'pdf');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleEXCELExport = async () => {
    setDialogOpen(false);
    try {
      if (reportType === 'detailed-timesheet') {
        await generateDetailedReport(currentFilter, 'excel');
      } else if (reportType === 'timesheet-entries') {
        await generateTimesheetEntries(currentFilter, 'excel');
      }
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const displayError = previewError || generatorError;
  
  const button = (
    <BaseBtn
        startIcon={<RestartAltRoundedIcon />}
        variant="contained"
        onClick={handleReset}
      >
        Reset
      </BaseBtn>
  );

  const hasPreviewData = groupedPreviewData && Object.keys(groupedPreviewData).length > 0;
  
  console.log('ReportWindow state:', {
    reportType,
    isFilterValid,
    isLoadingPreview,
    hasPreviewData,
    groupedPreviewDataKeys: Object.keys(groupedPreviewData),
    displayError
  });

  return (
    <WindowLayout title="Report" buttons={button}>
      <ReportLayout
        filterSection={
          <ReportFilterComponent 
            resetTrigger={resetTrigger}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
        }
        previewSection={
          <TabContext value={tabValue}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Header Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {/* Report Type Tabs - Left Corner */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="report type tabs">
                    <Tab label="Detailed TimeSheet" value="1" disabled={!isFilterValid} />
                    <Tab label="Timesheet Entries" value="2" disabled={!isFilterValid} />
                  </TabList>
                </Box>

                {/* Generate Button - Right Corner */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BaseBtn 
                    variant="contained" 
                    onClick={handleGenerateReport}
                    disabled={!isFilterValid || isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </BaseBtn>
                </Box>
              </Box>

              {/* Preview Content - Tab Panels */}
              <Box sx={{ width: '100%' }}>
                <TabPanel value="1">
                  {/* Detailed TimeSheet Preview Content */}
                  {isLoadingPreview ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : displayError ? (
                    <HelperText color="error">{displayError}</HelperText>
                  ) : hasPreviewData ? (
                    <ReportGroupedPreview groupedPreviewData={groupedPreviewData} />
                  ) : (
                    <HelperText>
                      Apply the required report filters to generate and preview the report
                    </HelperText>
                  )}
                </TabPanel>
                <TabPanel value="2">
                  {/* Timesheet Entries Preview Content */}
                  {isLoadingPreview ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : displayError ? (
                    <HelperText color="error">{displayError}</HelperText>
                  ) : hasPreviewData ? (
                    <ReportGroupedPreview groupedPreviewData={groupedPreviewData} />
                  ) : (
                    <HelperText>
                      Apply the required report filters to generate and preview the report
                    </HelperText>
                  )}
                </TabPanel>
              </Box>
            </Box>
          </TabContext>
        }
      />
      <ConformationDailog
        open={dialogOpen}
        title="Export Report"
        message="Choose the format you want to export the report"
        confirmText="PDF"
        cancelText="EXCEL"
        onConfirm={handlePDFExport}
        onCancel={handleEXCELExport}
        onClose={handleDialogClose}
      />
    </WindowLayout>
  );
}

export default ReportWindow;
