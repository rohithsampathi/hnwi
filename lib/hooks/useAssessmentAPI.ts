// lib/hooks/useAssessmentAPI.ts
// API integration for assessment using existing secureApi

import { useState } from 'react';
import { secureApi } from '@/lib/secure-api';

interface StartAssessmentPayload {
  user_id?: string;
  email?: string;
}

interface SubmitAnswerPayload {
  session_id: string;
  question_id: string;
  choice_id: string;
  response_time: number;
}

interface CompleteAssessmentPayload {
  session_id: string;
}

interface CanRetakePayload {
  user_id?: string;
  email?: string;
}

interface LinkUserPayload {
  user_id: string;
}

export const useAssessmentAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    requireAuth: boolean = false // Will be set per-endpoint based on need
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (method === 'GET') {
        // Note: secureApi.get signature is (endpoint, requireAuth, bustCache)
        response = await secureApi.get(endpoint, requireAuth, false);
      } else {
        response = await secureApi.post(endpoint, body, requireAuth);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (data: StartAssessmentPayload) => {
    return apiCall('/api/assessment/start', 'POST', data);
  };

  const submitAnswer = async (data: SubmitAnswerPayload) => {
    return apiCall('/api/assessment/answer', 'POST', data);
  };

  const getStatus = async (sessionId: string) => {
    return apiCall(`/api/assessment/${sessionId}`, 'GET');
  };

  const getResults = async (sessionId: string) => {
    return apiCall(`/api/assessment/${sessionId}/results`, 'GET');
  };

  const linkUserToSession = async (sessionId: string, payload: LinkUserPayload) => {
    return apiCall(`/api/assessment/${sessionId}/link-user`, 'POST', payload);
  };

  const checkRetakeEligibility = async (payload?: CanRetakePayload) => {
    const params = new URLSearchParams();
    if (payload?.user_id) params.append('user_id', payload.user_id);
    if (payload?.email) params.append('email', payload.email);

    return apiCall(`/api/assessment/can-retake?${params.toString()}`, 'GET');
  };

  const getAssessmentHistory = async (userId: string, email?: string) => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);

    return apiCall(`/api/assessment/history/${userId}?${params.toString()}`, 'GET');
  };

  const completeAssessment = async (payload: CompleteAssessmentPayload) => {
    return apiCall('/api/assessment/complete', 'POST', payload);
  };

  const downloadPDF = async (sessionId: string, dynamic: boolean = true) => {
    setLoading(true);
    setError(null);

    try {
      // Use secureApi.fetchWithAuth for authenticated file downloads
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `/api/assessment/${sessionId}/pdf?dynamic=${dynamic}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HNWI_Assessment_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    startAssessment,
    submitAnswer,
    getStatus,
    getResults,
    linkUserToSession,
    checkRetakeEligibility,
    getAssessmentHistory,
    completeAssessment,
    downloadPDF,
    loading,
    error,
  };
};
