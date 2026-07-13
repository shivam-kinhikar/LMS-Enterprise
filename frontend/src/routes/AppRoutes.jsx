import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

import Dashboard from '../pages/Dashboard';
import LeadList from '../pages/LeadList';
import LeadDetails from '../pages/LeadDetails';
import FollowupList from '../pages/FollowupList';
import ReportList from '../pages/ReportList';
import Settings from '../pages/Settings';
import Login from '../pages/Login';

// Mock pages for routing architecture
const NotFound = () => <div>404 Not Found</div>;

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes using Dashboard Layout */}
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<LeadList />} />
        <Route path="leads/:id" element={<LeadDetails />} />
        <Route path="followups" element={<FollowupList />} />
        <Route path="reports" element={<ReportList />} />
        <Route path="settings" element={<Settings />} />
        {/* Further protected routes go here */}
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
