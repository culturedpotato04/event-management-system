import api from './api';

export const createReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data.data;
};

export const getEventReviews = async (eventId) => {
  const response = await api.get(`/reviews/event/${eventId}`);
  return response.data.data;
};

export const updateReview = async (id, data) => {
  const response = await api.put(`/reviews/${id}`, data);
  return response.data.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data.data;
};

export const updateReviewStatus = async (id, isVisible) => {
  const response = await api.patch(`/reviews/${id}/status`, { isVisible });
  return response.data.data;
};
