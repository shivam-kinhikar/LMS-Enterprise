import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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

// Role Guard Wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user || !user.role) return <Navigate to="/dashboard" replace />; // Wait for user to load
  if (!allowedRoles.includes(user.role.role_name)) {
    return <Navigate to="/dashboard" replace />;
  }
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
        <Route path="leads" element={<RoleRoute allowedRoles={['Super Admin', 'Admin', 'Sales Head', 'Manager', 'Sales Exec']}><LeadList /></RoleRoute>} />
        <Route path="leads/:id" element={<RoleRoute allowedRoles={['Super Admin', 'Admin', 'Sales Head', 'Manager', 'Sales Exec']}><LeadDetails /></RoleRoute>} />
        <Route path="followups" element={<RoleRoute allowedRoles={['Super Admin', 'Admin', 'Sales Head', 'Manager', 'Sales Exec']}><FollowupList /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute allowedRoles={['Super Admin', 'Admin', 'Sales Head', 'Manager']}><ReportList /></RoleRoute>} />
        <Route path="settings" element={<Settings />} />
        {/* Further protected routes go here */}
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
