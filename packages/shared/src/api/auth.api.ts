import { getApiClient } from './client';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import type { IAuthResponse, IAuthTokens } from '../interfaces';
import type { IUser } from '../interfaces';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  get: {
    me: () =>
      getApiClient().get<IUser>(API_ENDPOINTS.AUTH.ME),
  },

  post: {
    login: (payload: LoginPayload) =>
      getApiClient().post<IAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),

    register: (payload: RegisterPayload) =>
      getApiClient().post<IAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, payload),

    logout: () =>
      getApiClient().post<void>(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: (refreshToken: string) =>
      getApiClient().post<IAuthTokens>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
  },
};
