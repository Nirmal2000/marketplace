import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeploymentStatus } from '@/lib/render-api';

export async function GET(request) {
  try {
    console.log('📡 API: Fetching all MCPs from database...')
    // Fetch all MCPs from database
    const { data: mcps, error: fetchError } = await supabase
      .from('mcps')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ API: Error fetching MCPs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch MCPs' },
        { status: 500 }
      );
    }

    console.log(`✅ API: Successfully fetched ${(mcps || []).length} MCPs`)
    return NextResponse.json({ mcps: mcps || [] });

  } catch (error) {
    console.error('💥 API: Error in marketplace API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    console.log('🔄 API: PATCH request received for deployment status check')
    const body = await request.json();
    const { id } = body;
    console.log(`📋 API: Checking status for MCP ID: ${id}`)

    if (!id) {
      console.error('❌ API: MCP id is required')
      return NextResponse.json(
        { error: 'MCP id is required' },
        { status: 400 }
      );
    }

    // Get the MCP record
    console.log(`🔍 API: Fetching MCP record from database...`)
    const { data: mcp, error: fetchError } = await supabase
      .from('mcps')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ API: Error fetching MCP:', fetchError);
      return NextResponse.json(
        { error: 'MCP not found' },
        { status: 404 }
      );
    }

    console.log(`📦 API: Found MCP: ${mcp.name} | Status: ${mcp.status} | Service: ${mcp.render_service_id} | Deploy: ${mcp.deploy_id}`)

    // Only check status for MCPs that have both render_service_id and deploy_id
    if (!mcp.render_service_id || !mcp.deploy_id) {
      console.error(`❌ API: Missing IDs - Service: ${mcp.render_service_id}, Deploy: ${mcp.deploy_id}`)
      return NextResponse.json(
        { error: 'Missing render_service_id or deploy_id' },
        { status: 400 }
      );
    }

    // Check deployment status using Render API
    console.log(`🚀 API: Calling Render API with serviceId: ${mcp.render_service_id}, deployId: ${mcp.deploy_id}`)
    let newStatus;
    try {
      const deploymentResponse = await getDeploymentStatus(mcp.render_service_id, mcp.deploy_id);
      newStatus = deploymentResponse.status;
      console.log(`📊 API: Render API returned status: ${newStatus}`)
    } catch (renderError) {
      console.error('💥 API: Error checking Render deployment status:', renderError);
      return NextResponse.json(
        { error: 'Failed to check deployment status' },
        { status: 500 }
      );
    }

    // Only update if status has changed
    if (newStatus && newStatus !== mcp.status) {
      console.log(`🔄 API: Status changed from ${mcp.status} to ${newStatus}, updating database...`)
      
      // Extract deploy_url from output_json if status is becoming live
      let deployUrl = mcp.deploy_url;
      if (newStatus === 'live' && !deployUrl && mcp.output_json?.service?.serviceDetails?.url) {
        deployUrl = mcp.output_json.service.serviceDetails.url;
        console.log(`📍 API: Extracted deploy_url for live service: ${deployUrl}`);
      }
      
      const { data: updatedMcp, error: updateError } = await supabase
        .from('mcps')
        .update({ 
          status: newStatus,
          deploy_url: deployUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ API: Error updating MCP status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update MCP status' },
          { status: 500 }
        );
      }

      console.log(`✅ API: Successfully updated MCP status`)
      return NextResponse.json({ 
        mcp: updatedMcp,
        statusChanged: true,
        oldStatus: mcp.status,
        newStatus: newStatus
      });
    }

    // Status hasn't changed
    console.log(`📊 API: Status unchanged (${mcp.status})`)
    return NextResponse.json({ 
      mcp: mcp,
      statusChanged: false
    });

  } catch (error) {
    console.error('💥 API: Error in marketplace PATCH API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}