import api from './api';
import { Challenge, ChallengeSubmissionResult } from '../types';

export const challengeService = {
    getAllChallenges: async () => {
        const response = await api.get<{ success: boolean; data: Challenge[] }>('/challenges');
        return response.data.data;
    },

    getChallengeById: async (id: string) => {
        const response = await api.get<{ success: boolean; challenge: Challenge }>(`/challenges/${id}`);
        return response.data.challenge;
    },

    submitSolution: async (id: string, code: string, language: string) => {
        const response = await api.post<{ success: boolean; submission: any; message: string }>(`/challenges/${id}/submit`, {
            code,
            language
        });
        return response.data;
    }
};
