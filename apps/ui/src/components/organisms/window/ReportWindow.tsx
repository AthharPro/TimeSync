import WindowLayout from '../../templates/other/WindowLayout';
import { BaseBtn } from '../../atoms';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ReportLayout from '../../templates/report/ReportLayout';
import { IReportWindowProps } from 'apps/ui/src/interfaces/report/IReport';
import { ReportFilter } from '../report/ReportFilter';
import ReportPreviewLayout from '../../templates/report/ReportPreviewLayout';
import { Button } from '@mui/material';
import { ButtonGroup } from '@mui/material';
import DataTable from '../../templates/other/DataTable';
import { useState } from 'react';

function ReportWindow({ onReset }: IReportWindowProps) {
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
    onReset?.();
  };
  
  const button = (
    <>
      <BaseBtn
        startIcon={<RestartAltRoundedIcon />}
        variant="contained"
        onClick={handleReset}
      >
        Reset
      </BaseBtn>
    </>
  );
  return (
    <WindowLayout title="Report" buttons={button}>
      <ReportLayout
        filterSection={<ReportFilter resetTrigger={resetTrigger} />}
        previewSection={
          <ReportPreviewLayout
            reportType={
              <ButtonGroup size="medium" variant="outlined">
                <Button>Detailed TimeSheet</Button>
                <Button>Timesheet Entries</Button>
              </ButtonGroup>
            }
            generateBtn={<BaseBtn variant="contained">Generate Report</BaseBtn>}
            preview={
           <></>  
            }
          />
        }
      />
    </WindowLayout>
  );
}

export default ReportWindow;
