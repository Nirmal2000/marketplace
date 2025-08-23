import DeploymentStatus from '@/components/custom/DeploymentStatus';
import { getService } from '@/lib/storage';

export default async function StatusPage({ params }) {
  const { serviceId } = await params;

  // Get initial service data from localStorage (server-side)
  let initialService = null;
  if (typeof window !== 'undefined') {
    initialService = getService(serviceId);
  }

  return <DeploymentStatus serviceId={serviceId} initialService={initialService} />;
}
