import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { dashboardAPI } from '@/services/api';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export default function EventLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      const offset = currentPage * pageSize;
      const response = await dashboardAPI.getRecentLogs(pageSize, offset);
      setLogs(response.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId) => {
    try {
      await dashboardAPI.retryDelivery(logId);
      alert('Delivery queued for retry');
      fetchLogs();
    } catch (error) {
      console.error('Error retrying delivery:', error);
      alert('Failed to retry delivery');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading logs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Logs</h1>
        <p className="text-gray-600 mt-2">View webhook delivery history and status</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Logs</CardTitle>
              <CardDescription>Recent webhook delivery attempts</CardDescription>
            </div>
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="8" className="text-center text-gray-500 py-8">
                    No delivery logs yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.event_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.target_url || 'N/A'}</TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge variant="success">Success</Badge>
                      ) : log.status === 'failed' ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : (
                        <Badge variant="secondary">{log.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.attempt_count}</TableCell>
                    <TableCell>
                      {log.response_code ? (
                        <span className={log.response_code >= 200 && log.response_code < 300 ? 'text-green-600' : 'text-red-600'}>
                          {log.response_code}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.status === 'failed' && log.attempt_count < 3 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRetry(log.id)}
                          title="Retry delivery"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage + 1}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={logs.length < pageSize}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

