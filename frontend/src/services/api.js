// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mi-proyecto-integrador.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;