import { NextResponse } from 'next/server';
import { getDeploymentStatus } from '@/lib/render-api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const deployId = searchParams.get('deployId');

    // Validate required parameters
    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId parameter is required' },
        { status: 400 }
      );
    }

    if (!deployId) {
      return NextResponse.json(
        { error: 'deployId parameter is required' },
        { status: 400 }
      );
    }

    // Call Render API to get deployment status
    const deploymentResponse = await getDeploymentStatus(serviceId, deployId);
    
    // Extract only the status field from response
    const status = deploymentResponse.status;

    if (!status) {
      return NextResponse.json(
        { error: 'No status found in deployment response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status });

  } catch (error) {
    console.error('Error checking deployment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check deployment status' },
      { status: 500 }
    );
  }
}