import React from 'react'
import Box from '@mui/material/Box'
import FeatureListItem from '../../atoms/landing/FeatureListItem'
import { IFeatureListProps } from '../../../interfaces/landing'

const FeatureList: React.FC<IFeatureListProps> = ({ features }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 1.5,
      }}
   >
      {features.map((text, idx) => (
        <FeatureListItem key={idx} text={text} />
      ))}
    </Box>
  )
}

export default FeatureList


