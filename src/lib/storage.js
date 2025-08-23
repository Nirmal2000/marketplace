// Local storage utilities for user management and service tracking

const STORAGE_KEYS = {
  USER_ID: 'mcp_user_id',
  USER_SERVICES: 'mcp_user_services',
  USER_DATA: 'mcp_user_data'
};

// Simple server-side storage for services (in-memory, resets on server restart)
let serverServices = new Map();

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Generate or retrieve user UUID
export const getOrCreateUserId = () => {
  if (!isBrowser) {
    // Server-side: return a default ID or generate one
    return 'server-user-id';
  }

  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

// Store user data
export const setUserData = (data) => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
};

// Get user data
export const getUserData = () => {
  if (!isBrowser) return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

// Store service data
export const addService = (serviceData) => {
  const serviceId = crypto.randomUUID();
  const newService = {
    id: serviceId,
    ...serviceData,
    createdAt: new Date().toISOString()
  };

  if (isBrowser) {
    // Client-side: use localStorage
    const services = getServices();
    services.push(newService);
    localStorage.setItem(STORAGE_KEYS.USER_SERVICES, JSON.stringify(services));
  } else {
    // Server-side: use in-memory Map
    serverServices.set(serviceId, newService);
  }

  return newService;
};

// Get all services
export const getServices = () => {
  if (isBrowser) {
    const services = localStorage.getItem(STORAGE_KEYS.USER_SERVICES);
    return services ? JSON.parse(services) : [];
  } else {
    return Array.from(serverServices.values());
  }
};

// Update service status
export const updateService = (serviceId, updateData) => {
  if (isBrowser) {
    const services = getServices();
    const serviceIndex = services.findIndex(service => service.id === serviceId);
    if (serviceIndex !== -1) {
      services[serviceIndex] = {
        ...services[serviceIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.USER_SERVICES, JSON.stringify(services));
      return services[serviceIndex];
    }
  } else {
    const service = serverServices.get(serviceId);
    if (service) {
      const updatedService = {
        ...service,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      serverServices.set(serviceId, updatedService);
      return updatedService;
    }
  }
  return null;
};

// Get service by ID
export const getService = (serviceId) => {
  if (isBrowser) {
    const services = getServices();
    return services.find(service => service.id === serviceId) || null;
  } else {
    return serverServices.get(serviceId) || null;
  }
};

// Delete service
export const deleteService = (serviceId) => {
  if (isBrowser) {
    const services = getServices();
    const filteredServices = services.filter(service => service.id !== serviceId);
    localStorage.setItem(STORAGE_KEYS.USER_SERVICES, JSON.stringify(filteredServices));
  } else {
    serverServices.delete(serviceId);
  }
};

// Clear all user data
export const clearUserData = () => {
  if (!isBrowser) return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
