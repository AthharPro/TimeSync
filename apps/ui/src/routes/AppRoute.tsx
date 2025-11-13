import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';

const AppRoute: React.FC = () => {

  return (
    <Routes>
      <Route
        path="/"
        element={<AdminPage />}
      />
      <Route
        path="/admin"
        element={<AdminPage />}
      />
     
    </Routes>
  );
};

export default AppRoute;
