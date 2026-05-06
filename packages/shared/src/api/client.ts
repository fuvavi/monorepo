import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

let _client: AxiosInstance | null = null;

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, getToken, onUnauthorized } = config;

  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  client.interceptors.response.use(
    res => res,
    error => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  _client = client;
  return client;
}

export function getApiClient(): AxiosInstance {
  if (!_client) {
    throw new Error("[shared/api] Client chưa được khởi tạo. Gọi createApiClient() ở entry point của app trước.");
  }
  return _client;
}
