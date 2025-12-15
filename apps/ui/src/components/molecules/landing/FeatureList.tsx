import React from 'react'
import Box from '@mui/material/Box'
import FeatureListItem from '../../atoms/landing/FeatureListItem'
import { IFeatureListProps } from '../../../interfaces/landing'

const FeatureList: React.FC<IFeatureListProps> = ({ features }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        alignItems: 'flex-start',
        paddingLeft: '27%',
      }}
   >
      {features.map((text, idx) => (
        <FeatureListItem key={idx} text={text} />
      ))}
    </Box>
  )
}

export default FeatureList


