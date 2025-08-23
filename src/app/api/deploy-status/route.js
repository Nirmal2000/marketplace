import { NextResponse } from 'next/server';
import { getServiceStatus, getDeploymentStatus } from '@/lib/render-api';
import { getService, updateService } from '@/lib/storage';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const deploymentId = searchParams.get('deploymentId');

    // Require both serviceId and deploymentId
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required - only deployment details are returned' },
        { status: 400 }
      );
    }

    // Get service from local storage
    const localService = getService(serviceId);
    if (!localService) {
      return NextResponse.json(
        { error: 'Service not found in local storage' },
        { status: 404 }
      );
    }

    // Check if we have a valid render service ID
    if (!localService.renderServiceId) {
      console.error('Service missing renderServiceId:', localService);
      return NextResponse.json(
        { error: 'Service missing Render service ID' },
        { status: 400 }
      );
    }

    // Get detailed deployment data directly from Render's API
    const apiKey = process.env.RENDER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Render API key not configured' },
        { status: 500 }
      );
    }

    const deploymentResponse = await fetch(
      `https://api.render.com/v1/services/${localService.renderServiceId}/deploys/${deploymentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { error: `Render API error: ${errorData.message}` },
        { status: deploymentResponse.status }
      );
    }

    const detailedDeploymentData = await deploymentResponse.json();

    // Also get deployment data using our utility function as backup
    let deploymentData = null;
    try {
      deploymentData = await getDeploymentStatus(localService.renderServiceId, deploymentId);
    } catch (error) {
      console.warn('Could not fetch deployment data via utility:', error.message);
    }

    // Return only deployment details
    return NextResponse.json({
      serviceId: serviceId,
      deploymentId: deploymentId,
      renderServiceId: localService.renderServiceId,
      detailedDeploymentData,
      deploymentData,
      serviceInfo: {
        name: localService.name,
        repo: localService.repo,
        branch: localService.branch
      }
    });

  } catch (error) {
    console.error('Error fetching deployment details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deployment details' },
      { status: 500 }
    );
  }
}
