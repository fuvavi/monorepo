import { getApiClient } from './client';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import type { IUser } from '../interfaces';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
}

export const userApi = {
  get: {
    list: (params?: UserListQuery) =>
      getApiClient().get<PaginatedResponse<IUser>>(API_ENDPOINTS.USERS.LIST, { params }),

    byId: (id: string) =>
      getApiClient().get<IUser>(API_ENDPOINTS.USERS.BY_ID(id)),
  },

  post: {
    create: (payload: Partial<IUser>) =>
      getApiClient().post<IUser>(API_ENDPOINTS.USERS.LIST, payload),
  },

  patch: {
    update: (id: string, payload: UpdateUserPayload) =>
      getApiClient().patch<IUser>(API_ENDPOINTS.USERS.BY_ID(id), payload),

    updateStatus: (id: string, isActive: boolean) =>
      getApiClient().patch<IUser>(API_ENDPOINTS.USERS.UPDATE_STATUS(id), { isActive }),
  },

  delete: {
    remove: (id: string) =>
      getApiClient().delete<void>(API_ENDPOINTS.USERS.BY_ID(id)),
  },
};
