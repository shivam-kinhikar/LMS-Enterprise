import axiosClient from './axiosClient';

export const fetchLeads = async (params) => {
  // params could be { search: 'John', page: 1 }
  const response = await axiosClient.get('/leads', { params });
  return response.data; // Returning data array
};

export const getLead = async (leadId) => {
  const response = await axiosClient.get(`/leads/${leadId}`);
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await axiosClient.post('/leads', leadData);
  return response.data;
};

export const updateLead = async (leadId, leadData) => {
  const response = await axiosClient.put(`/leads/${leadId}`, leadData);
  return response.data;
};

export const deleteLead = async (leadId) => {
  const response = await axiosClient.delete(`/leads/${leadId}`);
  return response.data;
};

export const bulkDeleteLeads = async (leadIds) => {
  const response = await axiosClient.post('/leads/bulk-delete', { ids: leadIds });
  return response.data;
};
