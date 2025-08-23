import { NextResponse } from 'next/server';
import { createRenderService } from '@/lib/render-api';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();

    // Get owner ID from environment variables
    const ownerId = process.env.RENDER_OWNER_ID;
    if (!ownerId) {
      return NextResponse.json(
        { error: 'RENDER_OWNER_ID not configured in environment variables' },
        { status: 500 }
      );
    }

    // Validate required fields
    const requiredFields = ['name', 'repo'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate GitHub repository URL
    if (!body.repo.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/)) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL format' },
        { status: 400 }
      );
    }

    // Create service on Render
    const renderResponse = await createRenderService({
      name: body.name,
      ownerId: ownerId,
      repo: body.repo,
      branch: body.branch || 'main',
      envVars: body.envVars || [],
      buildCommand: body.buildCommand,
      startCommand: body.startCommand,
      rootDir: body.rootDir,
      runtime: body.runtime,
      plan: body.plan
    });

    // Debug: Log the render response to see what we get
    console.log('Render API Response:', JSON.stringify(renderResponse, null, 2));

    // Extract service ID - handle different response formats
    const serviceId = renderResponse.id || renderResponse.service?.id;
    const serviceUrl = renderResponse.service?.url || renderResponse.url;
    const deployId = renderResponse.deployId || renderResponse.deployment?.id;

    if (!serviceId) {
      console.error('No service ID in render response:', renderResponse);
      return NextResponse.json(
        { error: 'Failed to get service ID from Render API response' },
        { status: 500 }
      );
    }

    // Get user ID from request body - should be sent from authenticated client
    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Store service data in database with input/output logging
    const serviceData = {
      user_id: body.userId,
      name: body.name,
      repo: body.repo,
      branch: body.branch || 'main',
      build_command: body.buildCommand,
      start_command: body.startCommand,
      root_dir: body.rootDir || '',
      runtime: body.runtime || 'node',
      env_vars: body.envVars || [],
      plan: body.plan || 'starter',
      deploy_id: deployId,
      deploy_url: serviceUrl,
      render_service_id: serviceId,
      status: renderResponse.status || 'pending',
      input_json: body,
      output_json: renderResponse
    };

    const { data: dbService, error: dbError } = await supabase
      .from('mcps')
      .insert([serviceData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store service data: ' + dbError.message },
        { status: 500 }
      );
    }

    // Format response to match expected structure
    const formattedService = {
      id: dbService.id,
      name: dbService.name,
      ownerId: ownerId,
      repo: dbService.repo,
      branch: dbService.branch,
      rootDir: dbService.root_dir,
      createdAt: dbService.created_at,
      updatedAt: dbService.updated_at,
      type: 'web_service',
      serviceDetails: {
        url: dbService.deploy_url,
        buildCommand: dbService.build_command,
        startCommand: dbService.start_command,
        buildPlan: dbService.plan,
        env: dbService.runtime
      }
    };

    return NextResponse.json({
      service: formattedService,
      deployId: deployId
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}
