import axiosClient from './axiosClient';

export const fetchLeadSources = async () => {
  const response = await axiosClient.get('/lead-sources');
  return response.data;
};

export const createLeadSource = async (data) => {
  const response = await axiosClient.post('/lead-sources', data);
  return response.data;
};

export const updateLeadSource = async ({ id, data }) => {
  const response = await axiosClient.put(`/lead-sources/${id}`, data);
  return response.data;
};

export const deleteLeadSource = async (id) => {
  const response = await axiosClient.delete(`/lead-sources/${id}`);
  return response.data;
};
