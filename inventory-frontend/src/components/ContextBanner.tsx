'use client';

import { useAuth } from '@/contexts/AuthContext';

export function ContextBanner() {
    const { user } = useAuth();

    // Only show for Super Admin
    if (user?.role !== 'super_admin') {
        return null;
    }

    // Determine current acting role
    let actingAs = 'Super Admin';
    let bgColor = 'bg-purple-50';
    let borderColor = 'border-purple-200';
    let textColor = 'text-purple-800';
    let icon = '👑';

    if (user.tenantId && user.locationId) {
        actingAs = 'Location User';
        bgColor = 'bg-blue-50';
        borderColor = 'border-blue-200';
        textColor = 'text-blue-800';
        icon = '📍';
    } else if (user.tenantId) {
        actingAs = 'Store Admin';
        bgColor = 'bg-green-50';
        borderColor = 'border-green-200';
        textColor = 'text-green-800';
        icon = '🏪';
    }

    return (
        <div className={`${bgColor} border-b ${borderColor} px-4 py-2`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                        <p className={`text-sm font-semibold ${textColor}`}>
                            Currently acting as: {actingAs}
                        </p>
                        {user.tenant && (
                            <p className="text-xs text-gray-600">
                                {user.tenant.name}
                                {user.location && ` • ${user.location.name}`}
                            </p>
                        )}
                    </div>
                </div>
                {(user.tenantId || user.locationId) && (
                    <a
                        href="/dashboard/super-admin"
                        className={`text-xs font-medium ${textColor} hover:underline`}
                    >
                        Change Context →
                    </a>
                )}
            </div>
        </div>
    );
}
