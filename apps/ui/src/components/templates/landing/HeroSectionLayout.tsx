import React from 'react';
import Box from '@mui/material/Box';
import SectionContainer from '../../atoms/landing/SectionContainer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { HeroSectionLayoutProps } from '../../../interfaces/landing/ILanding';

const HeroSectionLayout: React.FC<HeroSectionLayoutProps> = ({
  id = 'home',
  title,
  description,
  actions,
  image,
  background,
  mobileImageFirst = false,
}) => {
  const theme = useTheme();
  return (
    <Box
      id={id}
      sx={{
        pt: 12,
        pb: 8,
        scrollMarginTop: { xs: 80, sm: 96 },
        background,
      }}
    >
      <SectionContainer>
        <Box
          sx={{
            display: 'grid',
            alignItems: 'center',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gridTemplateAreas: mobileImageFirst
              ? { xs: '"image" "content"', md: '"content image"' }
              : { xs: '"content" "image"', md: '"content image"' },
          }}
        >
          <Box sx={{ gridArea: 'content' }}>
            <Stack spacing={3}>
              {title}
              {description ? (
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}
                >
                  {description}
                </Typography>
              ) : null}
              {actions}
            </Stack>
          </Box>
          <Box sx={{ gridArea: 'image', display: 'flex', justifyContent: 'center' }}>{image}</Box>
        </Box>
      </SectionContainer>
    </Box>
  );
};

export default HeroSectionLayout;
