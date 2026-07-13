import axiosClient from './axiosClient';

export const fetchFollowups = async (params) => {
  const response = await axiosClient.get('/followups', { params });
  return response.data; // Depending on interceptor, might already be unwrapped.
};

export const createFollowup = async (data) => {
  const response = await axiosClient.post('/followups', data);
  return response.data;
};

export const updateFollowup = async (id, data) => {
  const response = await axiosClient.put(`/followups/${id}`, data);
  return response.data;
};

export const deleteFollowup = async (id) => {
  const response = await axiosClient.delete(`/followups/${id}`);
  return response.data;
};
