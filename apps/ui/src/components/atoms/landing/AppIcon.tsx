import React from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { IAppIconProps } from '../../../interfaces/landing'

const AppIcon: React.FC<IAppIconProps> = ({ icon: Icon, size = 40, color, marginBottom = 2 }) => {
  const theme = useTheme()
  const resolvedColor = color ?? theme.palette.primary.main

  return (
    <Box sx={{ mb: marginBottom }}>
      <Icon sx={{ fontSize: size, color: resolvedColor }} />
    </Box>
  )
}

export default AppIcon


