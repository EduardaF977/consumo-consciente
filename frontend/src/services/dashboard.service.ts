import api from './api';
import { DashboardData } from '../types';

export const dashboardService = {
  async obter(periodo?: string): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/dashboard', { params: { periodo } });
    return data;
  },
};
