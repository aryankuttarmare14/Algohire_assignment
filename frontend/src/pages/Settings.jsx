import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { dashboardAPI } from '@/services/api';
import { CheckCircle, XCircle, Database, Activity } from 'lucide-react';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettingsData();
    const interval = setInterval(fetchSettingsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettingsData = async () => {
    try {
      const [healthData, statsData] = await Promise.all([
        dashboardAPI.getHealth(),
        dashboardAPI.getStats(),
      ]);
      setHealth(healthData.health);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">System configuration and health monitoring</p>
      </div>

      {/* System Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Backend service health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">PostgreSQL Database</h3>
                    <p className="text-sm text-gray-600">Event and webhook storage</p>
                  </div>
                </div>
                {health?.database === 'healthy' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <Badge variant="success">Healthy</Badge>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-5 h-5 mr-2" />
                    <Badge variant="destructive">Unhealthy</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium">{health?.database === 'healthy' ? 'Connected' : 'Disconnected'}</span>
                </div>
                {health?.databaseError && (
                  <div className="text-sm text-red-600 mt-2">
                    {health.databaseError}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Redis Cache</h3>
                    <p className="text-sm text-gray-600">Webhook caching and queues</p>
                  </div>
                </div>
                {health?.redis === 'healthy' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <Badge variant="success">Healthy</Badge>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-5 h-5 mr-2" />
                    <Badge variant="destructive">Unhealthy</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium">{health?.redis === 'healthy' ? 'Connected' : 'Disconnected'}</span>
                </div>
                {health?.redisError && (
                  <div className="text-sm text-red-600 mt-2">
                    {health.redisError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>Current data metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Total Events</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.events?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Total Webhooks</span>
                <span className="text-2xl font-bold text-purple-600">{stats?.webhooks?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Active Webhooks</span>
                <span className="text-2xl font-bold text-green-600">{stats?.webhooks?.active || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Successful Deliveries</span>
                <span className="text-2xl font-bold text-green-600">{stats?.deliveries?.successful || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Failed Deliveries</span>
                <span className="text-2xl font-bold text-red-600">{stats?.deliveries?.failed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Success Rate</span>
                <span className="text-2xl font-bold">
                  {stats && (stats.deliveries.successful + stats.deliveries.failed) > 0
                    ? `${Math.round((stats.deliveries.successful / (stats.deliveries.successful + stats.deliveries.failed)) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>System configuration details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Environment</span>
              <Badge variant="secondary">Development</Badge>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Backend URL</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">http://localhost:3001</code>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">API Version</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">v1.0.0</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Last Updated</span>
              <span className="text-sm text-gray-600">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

