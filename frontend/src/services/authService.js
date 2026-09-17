import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const updateDetails = async (details) => {
  const response = await api.put('/auth/updatedetails', details);
  return response.data.data;
};

export const updatePassword = async (passwords) => {
  const response = await api.put('/auth/updatepassword', passwords);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data.data;
};
