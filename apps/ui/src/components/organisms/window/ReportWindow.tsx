import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ReportLayout from '../../templates/report/ReportLayout';
import { IReportWindowProps } from '../../../interfaces/report/IReport';
import { ReportFilter } from '../report/ReportFilter';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useState } from 'react';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import { HelperText } from '../../atoms';

function ReportWindow({ onReset }: IReportWindowProps) {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [tabValue, setTabValue] = useState('1');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
    onReset?.();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleGenerateReport = () => {
    setDialogOpen(true);
  };

  const handlePDFExport = () => {
    setDialogOpen(false);
    // TODO: Implement PDF export logic
    console.log('Exporting as PDF...');
  };

  const handleEXCELExport = () => {
    setDialogOpen(false);
    // TODO: Implement EXCEL export logic
    console.log('Exporting as EXCEL...');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const button = (
    <BaseBtn
        startIcon={<RestartAltRoundedIcon />}
        variant="contained"
        onClick={handleReset}
      >
        Reset
      </BaseBtn>
  );
  return (
    <WindowLayout title="Report" buttons={button}>
      <ReportLayout
        filterSection={<ReportFilter resetTrigger={resetTrigger} />}
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
                    <Tab label="Detailed TimeSheet" value="1" />
                    <Tab label="Timesheet Entries" value="2" />
                  </TabList>
                </Box>

                {/* Generate Button - Right Corner */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BaseBtn variant="contained" onClick={handleGenerateReport}>
                    Generate Report
                  </BaseBtn>
                </Box>
              </Box>

              {/* Preview Content - Tab Panels */}
              <Box sx={{ width: '100%' }}>
                <TabPanel value="1">
                  {/* Detailed TimeSheet Preview Content */}
                  <HelperText>
                     Apply the required report filters to generate and preview the report
                  </HelperText>
                </TabPanel>
                <TabPanel value="2">
                  {/* Timesheet Entries Preview Content */}
                  <HelperText>
                    Apply the required report filters to generate and preview the report
                  </HelperText>
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
