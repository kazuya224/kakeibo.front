import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Spring BootのサーバーURL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;