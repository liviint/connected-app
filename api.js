import axios from "axios";
import {safeLocalStorage} from './utils/storage'

const baseURL = process.env.EXPO_PUBLIC_API_URL

export let api = axios.create({baseURL})

api.interceptors.request.use(
  async(config) => {
      const token = await safeLocalStorage.getItem("token")
      console.log(token,"hello token 123")
      if(token) config.headers.Authorization = `Bearer ${token}`;
      return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      //window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export let blogApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})
