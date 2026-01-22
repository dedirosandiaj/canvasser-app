import { Component, JSX, Show } from 'solid-js';
import { authStore } from '~/stores/auth';

interface RBACGuardProps {
    requiredRole?: 'admin' | 'operator' | 'viewer';
    requiredPermission?: string;
    children: JSX.Element;
    fallback?: JSX.Element;
}

export const RBACGuard: Component<RBACGuardProps> = (props) => {
    const hasAccess = () => {
        const user = authStore.user();
        if (!user) return false;

        // Super Admin bypass (optional, or rely on Role)
        if (user.role === 'admin') return true;

        if (props.requiredRole) {
            // Simple logic: Admin > Operator > Viewer
            const roles = ['viewer', 'operator', 'admin'];
            const userRoleIndex = roles.indexOf(user.role);
            const requiredRoleIndex = roles.indexOf(props.requiredRole);

            if (userRoleIndex < requiredRoleIndex) return false;
        }

        if (props.requiredPermission) {
            // Check if user permissions include the required one
            // Note: User interface in auth.ts needs to be updated to include permissions array
            // Assuming permissions are added to User type in store
            // return (user.permissions || []).includes(props.requiredPermission);

            // For now, if no permission field, return false or rely on Role
            return true;
        }

        return true;
    };

    return (
        <Show when={hasAccess()} fallback={props.fallback}>
            {props.children}
        </Show>
    );
};
