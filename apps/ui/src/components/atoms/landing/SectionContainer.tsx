import React from 'react';
import Container from '@mui/material/Container';
import { ISectionContainerProps } from '../../../interfaces/landing';

const SectionContainer: React.FC<ISectionContainerProps> = ({ children, maxWidth = 'xl', component: Component }) => {
  return (
    <Container maxWidth={maxWidth} {...(Component ? { component: Component } : {})}>
      {children}
    </Container>
  );
};

export default SectionContainer;


