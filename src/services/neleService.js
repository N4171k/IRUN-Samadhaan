import { buildApiUrl } from '../config/env';

const NELE_API_BASE_URL = buildApiUrl('api');

class NELEService {
    async startMonitoring() {
        try {
            const response = await fetch(`${NELE_API_BASE_URL}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to start monitoring');
            }
            return data;
        } catch (error) {
            console.error('Error starting monitoring:', error);
            throw error;
        }
    }

    async stopMonitoring() {
        try {
            const response = await fetch(`${NELE_API_BASE_URL}/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to stop monitoring');
            }
            return data;
        } catch (error) {
            console.error('Error stopping monitoring:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const response = await fetch(`${NELE_API_BASE_URL}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch stats');
            }
            return data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
}

export const neleService = new NELEService();
