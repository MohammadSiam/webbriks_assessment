import axios, { type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@webbriks/shared-types";
import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export async function apiRequest<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await client.request<ApiResponse<T>>({ url: path, ...config });
    const body = response.data;
    if (!body.success) {
      throw new ApiError(body.message, response.status);
    }
    return body.data;
  } catch (error) {
    if (axios.isAxiosError<ApiResponse<T>>(error) && error.response) {
      const body = error.response.data;
      const message = !body.success ? body.message : error.message;
      throw new ApiError(message, error.response.status);
    }
    throw error;
  }
}
