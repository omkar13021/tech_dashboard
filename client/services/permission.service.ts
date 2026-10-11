import axiosInstance from '@/lib/axios';

export interface PermissionCatalogEntry {
  key: string;
  action: string;
  label: string;
}

export interface PermissionCatalogModule {
  module: string;
  label: string;
  permissions: PermissionCatalogEntry[];
}

export interface PermissionCatalog {
  modules: PermissionCatalogModule[];
}

export const permissionApi = {
  async getCatalog(): Promise<PermissionCatalog> {
    const res = await axiosInstance.get<PermissionCatalog>('/permissions');
    return res.data;
  },
};
