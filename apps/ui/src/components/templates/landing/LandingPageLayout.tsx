import React from 'react'
import Box from '@mui/material/Box'
import Header from '../../organisms/landing/Header'
import Footer from '../../organisms/landing/Footer'
import { useTheme } from '@mui/material/styles'

const LandingPageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const theme = useTheme()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box component="main" sx={{ flex: 1, pt: { xs: 7, sm: 7 } }}>
        {children}
      </Box>
      <Footer />
    </Box>
  )
}

export default LandingPageLayout
