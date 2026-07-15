import axiosClient from './axiosClient';

export const fetchDashboardStats = async (params = {}) => {
  const response = await axiosClient.get('/dashboard', { params });
  return response.data;
};

export const clearAllData = async () => {
  const response = await axiosClient.delete('/dashboard/clear');
  return response.data;
};
