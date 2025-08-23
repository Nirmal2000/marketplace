'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(50, 'Name must be less than 50 characters'),
  repo: z.string().url('Must be a valid GitHub repository URL').refine(
    (url) => url.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/),
    'Must be a valid GitHub repository URL (https://github.com/username/repo)'
  ),
  branch: z.string().min(1, 'Branch is required'),
  buildCommand: z.string().min(1, 'Build command is required'),
  startCommand: z.string().min(1, 'Start command is required'),
  rootDir: z.string().optional(),
  runtime: z.string().optional()
});

export default function CreateMCPForm() {
  const router = useRouter();
  const userContext = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      repo: '',
      branch: 'main',
      buildCommand: '',
      startCommand: '',
      rootDir: '',
      runtime: 'node'
    }
  });

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index, field, value) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const parseEnvVarsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedVars = [];

    lines.forEach(line => {
      // Handle both KEY=value and KEY="value" formats
      const match = line.match(/^([^=]+)=(["']?)(.*)\2$/);
      if (match) {
        const [, key, , value] = match;
        if (key.trim() && value.trim()) {
          parsedVars.push({
            key: key.trim(),
            value: value.trim()
          });
        }
      }
    });

    return parsedVars;
  };

  const handleEnvVarPaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    const parsedVars = parseEnvVarsFromText(pastedText);

    if (parsedVars.length > 0) {
      e.preventDefault();
      // Add parsed vars to existing env vars, avoiding duplicates
      const existingKeys = new Set(envVars.map(env => env.key.toLowerCase()));
      const newVars = parsedVars.filter(env => !existingKeys.has(env.key.toLowerCase()));

      if (newVars.length > 0) {
        setEnvVars([...envVars, ...newVars]);
      }
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Get user ID from authenticated context
      if (!userContext?.user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('User context in form:', userContext);
      console.log('User ID being sent:', userContext.user.id);

      // Filter out empty env vars
      const filteredEnvVars = envVars.filter(env => env.key.trim() && env.value.trim());

      const payload = {
        ...data,
        userId: userContext.user.id,
        envVars: filteredEnvVars,
        plan: 'starter'
      };

      console.log('Payload being sent:', payload);

      const response = await fetch('/api/create-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create service');
      }

      // Redirect to marketplace page
      router.push('/marketplace');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-600">
      <CardHeader className="text-center">
        <CardTitle>Service Configuration</CardTitle>
        {/* <CardDescription>
          Configure your MCP service deployment settings
        </CardDescription> */}
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 text-red-300 bg-red-900/20 border border-red-700 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-mcp-service" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for your MCP service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="repo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username/repo" {...field} />
                    </FormControl>
                    <FormDescription>
                      The GitHub repository containing your MCP service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input placeholder="main" {...field} />
                    </FormControl>
                    <FormDescription>
                      The Git branch to deploy from
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Environment Variables Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Environment Variables</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addEnvVar}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                {/* Bulk Paste Textarea */}
                <div className="space-y-2">
                  {/* <FormLabel className="text-sm text-gray-600">Or paste environment variables</FormLabel> */}
                  {/* <Textarea
                    placeholder="DATABASE_URL=postgresql://example
FASHION_AI_TOKEN=fa-token
GMAIL_APP_PASSWORD=password"
                    onPaste={handleEnvVarPaste}
                    className="min-h-[80px] font-mono text-sm"
                  />
                  <FormDescription className="text-xs">
                    Paste your .env format variables here to auto-populate the fields below
                  </FormDescription> */}
                </div>

                {envVars.map((env, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="KEY"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      onPaste={handleEnvVarPaste}
                    />
                    <Input
                      placeholder="VALUE"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      onPaste={handleEnvVarPaste}
                    />
                    {envVars.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEnvVar(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runtime</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select runtime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="node">Node.js</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buildCommand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Build Command</FormLabel>
                    <FormControl>
                      <Input placeholder="npm run build" {...field} />
                    </FormControl>
                    <FormDescription>
                      Command to build your application (e.g., npm run build)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startCommand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Command</FormLabel>
                    <FormControl>
                      <Input placeholder="npm start" {...field} />
                    </FormControl>
                    <FormDescription>
                      Command to start your application (e.g., npm start)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rootDir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Root Directory (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave empty for root directory" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use repository root, or specify a subdirectory like './src'
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Service...
                  </>
                ) : (
                  'Create MCP Service'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
