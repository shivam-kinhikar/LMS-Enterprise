import axiosClient from './axiosClient';

export const fetchDashboardStats = async () => {
  const response = await axiosClient.get('/dashboard');
  return response.data; // The interceptor already returned response.data, so this is response.data.data from Laravel
};

export const clearAllData = async () => {
  const response = await axiosClient.delete('/dashboard/clear');
  return response.data;
};
