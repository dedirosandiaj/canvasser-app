/**
 * MainLayout Component
 * Berry Vue styled main application layout
 */

import { createSignal, JSX } from 'solid-js';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumbs } from './Breadcrumbs';
import { cn } from '~/lib/utils/cn';

export interface MainLayoutProps {
    children: JSX.Element;
}

export function MainLayout(props: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);
    const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed());
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen());
    };

    return (
        <div class="min-h-screen bg-gray-50">
            {/* Sidebar with mobile support */}
            <Sidebar
                collapsed={sidebarCollapsed()}
                onToggle={toggleSidebar}
                mobileOpen={mobileMenuOpen()}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Topbar */}
            <Topbar
                onMenuClick={toggleMobileMenu}
                onSidebarToggle={toggleSidebar}
                sidebarCollapsed={sidebarCollapsed()}
            />

            {/* Main content */}
            <main
                class={cn(
                    'transition-all duration-300 min-h-screen',
                    'pt-14', // Matches topbar height (h-14)
                    sidebarCollapsed() ? 'lg:ml-16' : 'lg:ml-64' // Matches sidebar width (w-16 or w-64)
                )}
            >
                <div class="p-6">
                    {/* Breadcrumbs */}
                    <Breadcrumbs class="mb-4" />

                    {/* Page content */}
                    {props.children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;
