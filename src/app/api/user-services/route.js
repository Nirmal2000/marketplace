import { NextResponse } from 'next/server';
import { getOrCreateUserId, getServices, getUserData } from '@/lib/storage';

export async function GET(request) {
  try {
    // Get current user ID
    const userId = getOrCreateUserId();

    // Get user data
    const userData = getUserData();

    // Get all services for this user
    const services = getServices();

    // Filter services by user ID if needed (for client-side calls)
    const userServices = services.filter(service => {
      // For server-side calls, all services are returned
      // For client-side calls, we might need additional filtering
      return true; // Return all services for now
    });

    // Calculate service statistics
    const totalServices = userServices.length;
    const liveServices = userServices.filter(service => service.status === 'live').length;
    const buildingServices = userServices.filter(service =>
      ['build_in_progress', 'update_in_progress'].includes(service.status)
    ).length;
    const failedServices = userServices.filter(service => service.status === 'failed').length;

    return NextResponse.json({
      user: {
        id: userId,
        data: userData,
        stats: {
          totalServices,
          liveServices,
          buildingServices,
          failedServices
        }
      },
      services: userServices,
      summary: {
        total: totalServices,
        live: liveServices,
        building: buildingServices,
        failed: failedServices
      }
    });

  } catch (error) {
    console.error('Error fetching user services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user services' },
      { status: 500 }
    );
  }
}
