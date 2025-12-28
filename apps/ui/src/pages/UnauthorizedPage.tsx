import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to access this resource. Please contact your administrator if you believe this is a mistake.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/', { replace: true })}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
