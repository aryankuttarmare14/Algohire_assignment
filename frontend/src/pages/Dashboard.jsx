import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, Webhook, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getHealth(),
      ]);
      setStats(statsData.stats);
      setHealth(healthData.health);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.events?.total || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Webhooks',
      value: stats?.webhooks?.active || 0,
      icon: Webhook,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Successful Deliveries',
      value: stats?.deliveries?.successful || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Failed Deliveries',
      value: stats?.deliveries?.failed || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and health monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current status of backend services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900">Database</h3>
                {health?.database === 'healthy' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Healthy</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Unhealthy</span>
                  </div>
                )}
              </div>
              {health?.databaseError && (
                <p className="text-sm text-red-600">{health.databaseError}</p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900">Redis</h3>
                {health?.redis === 'healthy' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Healthy</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Unhealthy</span>
                  </div>
                )}
              </div>
              {health?.redisError && (
                <p className="text-sm text-red-600">{health.redisError}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={fetchDashboardData}>
              Refresh Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

