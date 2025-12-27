import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set default base URL for axios
axios.defaults.baseURL = API_URL.replace('/api', '');

// Auth API
export const register = (userData) => axios.post(`${API_URL}/auth/register`, userData).then(res => {
  return { data: res.data };
});
export const login = (userData) => axios.post(`${API_URL}/auth/login`, userData).then(res => {
  return { data: res.data };
});
export const getCurrentUser = () => axios.get(`${API_URL}/auth/me`).then(res => {
  return { data: res.data.user || res.data };
});

// Posts API
export const getPosts = (params = '') => {
  const url = `${API_URL}/posts${params ? '?' + params : ''}`;
  return axios.get(url, {
    headers: {
      // Don't send auth token if not logged in - let optionalAuth handle it
    }
  });
};
export const getPost = (id) => axios.get(`${API_URL}/posts/${id}`);
export const createPost = (postData) => axios.post(`${API_URL}/posts`, postData).then(res => {
  return { data: res.data.post || res.data };
});
export const updatePost = (id, postData) => axios.put(`${API_URL}/posts/${id}`, postData).then(res => {
  return { data: res.data.post || res.data };
});
export const deletePost = (id) => axios.delete(`${API_URL}/posts/${id}`);
export const likePost = (id) => axios.put(`${API_URL}/posts/${id}/like`);

