import axiosClient from './axiosClient';

export const fetchReports = async () => {
  const response = await axiosClient.get('/reports');
  return response.data; // Depending on interceptor, might already be unwrapped.
};
