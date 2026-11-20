import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:7023/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});