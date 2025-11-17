import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { CheckCircle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { FeatureListItemProps } from '../../../interfaces/landing'

const FeatureListItem: React.FC<FeatureListItemProps> = ({ text }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CheckCircle sx={{ fontSize: 16, color: theme.palette.primary.main }} />
      <Typography variant="body2">{text}</Typography>
    </Box>
  )
}

export default FeatureListItem


