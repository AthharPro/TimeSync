import React from 'react'
import { IReportPreviewLayout } from '../../../interfaces/report/IReport'
import { Box } from '@mui/material'

const ReportPreviewLayout: React.FC<IReportPreviewLayout> = ({ reportType, generateBtn, preview }) => {
  return (
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
        {/* Report Type Button Group - Left Corner */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {reportType}
        </Box>

        {/* Generate Button - Right Corner */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {generateBtn}
        </Box>
      </Box>

      {/* Preview Table - Below Header Row */}
      <Box sx={{ width: '100%' }}>
        {preview}
      </Box>
    </Box>
  )
}

export default ReportPreviewLayout
