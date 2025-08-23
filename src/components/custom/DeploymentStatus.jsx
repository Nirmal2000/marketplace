'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    progress: 10
  },
  build_in_progress: {
    label: 'Building',
    color: 'bg-blue-100 text-blue-800',
    icon: Loader2,
    progress: 50
  },
  update_in_progress: {
    label: 'Updating',
    color: 'bg-blue-100 text-blue-800',
    icon: Loader2,
    progress: 75
  },
  live: {
    label: 'Live',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    progress: 100
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    progress: 0
  },
  unknown: {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    progress: 0
  }
};

export default function DeploymentStatus({ serviceId, initialService }) {
  const [service, setService] = useState(initialService);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    if (!serviceId) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/deploy-status?serviceId=${serviceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setService(data.service);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Set up polling for non-final states
    if (service && !['live', 'failed'].includes(service.status)) {
      const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [serviceId, service?.status]);

  if (!service) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading service information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[service.status] || STATUS_CONFIG.unknown;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {service.name}
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                Service ID: {service.id}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deployment Progress</span>
              <span>{statusConfig.progress}%</span>
            </div>
            <Progress value={statusConfig.progress} className="w-full" />
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Repository</h4>
              <p className="text-sm text-gray-600 break-all">{service.repo}</p>
              <p className="text-sm text-gray-600">Branch: {service.branch}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <p className="text-sm text-gray-600">Owner ID: {service.ownerId}</p>
              <p className="text-sm text-gray-600">Created: {new Date(service.createdAt).toLocaleString()}</p>
              {service.lastChecked && (
                <p className="text-sm text-gray-600">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Environment Variables */}
          {service.envVars && service.envVars.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Environment Variables</h4>
              <div className="space-y-1">
                {service.envVars.map((env, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {env.key}={env.value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service URL */}
          {service.renderServiceUrl && (
            <div>
              <h4 className="font-medium mb-2">Service URL</h4>
              <div className="flex items-center gap-2">
                <a
                  href={service.renderServiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {service.renderServiceUrl}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(service.renderServiceUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          <div className="pt-4 border-t">
            <div className="space-y-2">
              {service.status === 'live' && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Your MCP service is now live and ready to use!</span>
                </div>
              )}
              {service.status === 'failed' && (
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <span>Deployment failed. Please check your repository and configuration.</span>
                </div>
              )}
              {['build_in_progress', 'update_in_progress'].includes(service.status) && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Your service is being built and deployed. This may take a few minutes.</span>
                </div>
              )}
              {service.status === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="h-5 w-5" />
                  <span>Your service is queued for deployment. Please wait.</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
