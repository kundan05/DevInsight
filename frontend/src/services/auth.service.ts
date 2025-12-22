import api from './api';
import { User, LoginCredentials, RegisterCredentials } from '../types';

export const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (credentials: RegisterCredentials) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
