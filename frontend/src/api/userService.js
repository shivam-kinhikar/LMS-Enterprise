import axiosClient from './axiosClient';

export const fetchUsers = async () => {
  const response = await axiosClient.get('/users');
  return response.data;
};

export const fetchRoles = async () => {
  const response = await axiosClient.get('/roles');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosClient.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosClient.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response;
};
