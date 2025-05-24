// Main API file for handling API calls
import axios from 'axios';

const BASE_URL = 'https://dummyjson.com/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const api = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};

export default api;
