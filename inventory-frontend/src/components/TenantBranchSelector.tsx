'use client';

import { useEffect, useState } from 'react';
import { api, Tenant } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Location {
  id: string;
  name: string;
}

interface TenantLocationSelectorProps {
  onContextChange?: (tenantId: string | null, locationId: string | null) => void;
}

export function TenantBranchSelector({ onContextChange }: TenantLocationSelectorProps) {
  const { user, refreshUser } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  // Only show for Super Admin
  if (user?.role !== 'super_admin') {
    return null;
  }

  const fetchTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const fetchLocations = async (tenantId: string) => {
    try {
      const data = await api.getLocationsByTenant(tenantId);
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocations([]);
    }
  };

  const handleTenantChange = async (tenantId: string) => {
    setSelectedTenantId(tenantId || null);
    setSelectedLocationId(null);
    setLocations([]);
    
    if (tenantId) {
      await fetchLocations(tenantId);
    }
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId || null);
  };

  const handleApplyContext = async () => {
    setLoading(true);
    try {
      await api.switchContext(selectedTenantId, selectedLocationId);
      await refreshUser();
      
      if (onContextChange) {
        onContextChange(selectedTenantId, selectedLocationId);
      }
      
      alert('Context switched successfully! You can now perform Store Admin and Location User tasks.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to switch context: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearContext = async () => {
    setLoading(true);
    try {
      await api.switchContext(null, null);
      await refreshUser();
      setSelectedTenantId(null);
      setSelectedLocationId(null);
      setLocations([]);
      
      if (onContextChange) {
        onContextChange(null, null);
      }
      
      alert('Context cleared successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to clear context: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-amber-900">Super Admin Context</h3>
      </div>
      
      <p className="mb-4 text-xs text-amber-800">
        Select a shop and location to perform Store Admin or Location User tasks.
      </p>

      <div className="space-y-3">
        {/* Tenant Selector */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Select Shop (Tenant)
          </label>
          <select
            value={selectedTenantId || ''}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Select Shop --</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Selector */}
        {selectedTenantId && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Select Location (Optional)
            </label>
            <select
              value={selectedLocationId || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={locations.length === 0}
            >
              <option value="">-- Select Location --</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            {locations.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No locations available for this shop</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyContext}
            disabled={!selectedTenantId || loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? 'Applying...' : 'Apply Context'}
          </button>
          <button
            onClick={handleClearContext}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {loading ? 'Clearing...' : 'Clear'}
          </button>
        </div>
      </div>
    </div>
  );
}
