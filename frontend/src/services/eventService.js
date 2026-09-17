import api from './api';

export const searchEvents = async (params) => {
  const response = await api.get('/search/events', { params });
  return response.data;
};

export const getEvents = async (params) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getEvent = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data.data;
};

export const updateEventStatus = async (id, status) => {
  const response = await api.patch(`/events/${id}/status`, { status });
  return response.data.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.data;
};

export const getVenues = async () => {
  const response = await api.get('/venues');
  return response.data.data;
};
