// Render API integration utilities

const RENDER_API_BASE = 'https://api.render.com/v1';

// Get Render API key from environment variables
const getRenderApiKey = () => {
  return process.env.RENDER_API_KEY;
};

// Create a new service on Render
export const createRenderService = async (serviceData) => {
  const apiKey = getRenderApiKey();
  if (!apiKey) {
    throw new Error('Render API key not configured');
  }

  const response = await fetch(`${RENDER_API_BASE}/services`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      type: 'web_service',
      name: serviceData.name,
      ownerId: serviceData.ownerId,
      repo: serviceData.repo,
      branch: serviceData.branch || 'main',
      envVars: serviceData.envVars || [],
      rootDir: serviceData.rootDir || '',
      serviceDetails: {
        runtime: serviceData.runtime || 'node',
        envSpecificDetails: {
          buildCommand: serviceData.buildCommand || 'npm run build',
          startCommand: serviceData.startCommand || 'npm start'
        }
      },
      plan: serviceData.plan || 'starter'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Render API error: ${error.message}`);
  }

  return await response.json();
};

// Get service deployment status
export const getServiceStatus = async (serviceId) => {
  const apiKey = getRenderApiKey();
  if (!apiKey) {
    throw new Error('Render API key not configured');
  }

  const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Render API error: ${error.message}`);
  }

  return await response.json();
};

// Get deployment details
export const getDeploymentStatus = async (serviceId, deploymentId) => {
  const apiKey = getRenderApiKey();
  if (!apiKey) {
    throw new Error('Render API key not configured');
  }

  const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}/deploys/${deploymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Render API error: ${error.message}`);
  }

  return await response.json();
};

// List all services for the account
export const listServices = async (ownerId) => {
  const apiKey = getRenderApiKey();
  if (!apiKey) {
    throw new Error('Render API key not configured');
  }

  const response = await fetch(`${RENDER_API_BASE}/services?ownerId=${ownerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Render API error: ${error.message}`);
  }

  return await response.json();
};

// Delete a service
export const deleteService = async (serviceId) => {
  const apiKey = getRenderApiKey();
  if (!apiKey) {
    throw new Error('Render API key not configured');
  }

  const response = await fetch(`${RENDER_API_BASE}/services/${serviceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Render API error: ${error.message}`);
  }

  return await response.json();
};
