"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import secureApi, {
  getAuthenticatedUser,
  getAuthenticatedUserId,
  isUserAuthenticated 
} from "@/lib/secure-api";

export default function TestSecureApiPage() {
  const [authStatus, setAuthStatus] = useState<any>({});
  const [apiTestResults, setApiTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = () => {
    const status = {
      isAuthenticated: isUserAuthenticated(),
      userId: getAuthenticatedUserId(),
      user: getAuthenticatedUser(),
      timestamp: new Date().toISOString()
    };
    setAuthStatus(status);
  };

  const testCrownVault = async () => {
    try {
      setLoading(true);
      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error("No user ID found");
      }

      
      // Test Crown Vault assets
      const assets = await secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true);
      
      // Test Crown Vault stats
      const stats = await secureApi.get(`/api/crown-vault/stats?owner_id=${userId}`, true);
      
      // Test Crown Vault heirs
      const heirs = await secureApi.get(`/api/crown-vault/heirs?owner_id=${userId}`, true);

      const results = {
        success: true,
        assets: assets?.length || 0,
        stats: stats ? "Loaded" : "Failed",
        heirs: heirs?.length || 0,
        timestamp: new Date().toISOString()
      };

      setApiTestResults(prev => ({ ...prev, crownVault: results }));
    } catch (error) {
      setApiTestResults(prev => ({ 
        ...prev, 
        crownVault: { 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testDashboard = async () => {
    try {
      setLoading(true);
      
      // Test analytics
      const analytics = await secureApi.post('/api/analytics/activity', {
        user_id: getAuthenticatedUserId(),
        page: 'test'
      }, true);

      const results = {
        success: true,
        analytics: analytics ? "Loaded" : "Failed",
        timestamp: new Date().toISOString()
      };

      setApiTestResults(prev => ({ ...prev, dashboard: results }));
    } catch (error) {
      setApiTestResults(prev => ({ 
        ...prev, 
        dashboard: { 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const runDebugAuth = () => {
    // Debug auth removed (console logging removed)
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Secure API Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
          <div className="mt-4 space-x-2">
            <Button onClick={checkAuthStatus}>Refresh Auth Status</Button>
            <Button onClick={runDebugAuth} variant="outline">Run Debug Auth</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testCrownVault} 
                disabled={loading || !authStatus.isAuthenticated}
              >
                Test Crown Vault
              </Button>
              <Button 
                onClick={testDashboard} 
                disabled={loading || !authStatus.isAuthenticated}
              >
                Test Dashboard
              </Button>
            </div>
            
            {Object.keys(apiTestResults).length > 0 && (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto mt-4">
                {JSON.stringify(apiTestResults, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {!authStatus.isAuthenticated && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <p className="text-yellow-600 dark:text-yellow-400">
              You are not authenticated. Please log in first to test API calls.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}