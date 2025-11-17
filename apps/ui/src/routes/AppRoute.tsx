import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LandingPage from '../pages/LandingPage';

const AppRoute: React.FC = () => {

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/admin"
        element={<AdminPage />}
      />
     
    </Routes>
  );
};

export default AppRoute;
