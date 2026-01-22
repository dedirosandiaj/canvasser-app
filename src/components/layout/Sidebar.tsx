/**
 * Sidebar Component
 * Berry Vue styled navigation sidebar - compact design matching reference
 */

import { createSignal, createEffect, Show, For, JSX, onMount, createMemo } from 'solid-js';
import { A, useLocation, useNavigate } from '@solidjs/router';
import { cn } from '~/lib/utils/cn';
import { logoutAction } from '~/lib/server/actions.server';
import { useUser, PERMISSIONS } from '~/context/UserContext';

interface NavItem {
    title: string;
    icon: string;
    to?: string;
    badge?: string | number;
    badgeColor?: 'primary' | 'secondary' | 'error';
    children?: NavItem[];
    permission?: string; // Required permission to view this item
}

interface NavGroup {
    header?: string;
    items: NavItem[];
    permission?: string; // Required permission to view the entire group
}

export interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

// Navigation structure - PJP Monitor with Berry Vue style
const navigation: NavGroup[] = [
    {
        header: 'Dashboard',
        permission: PERMISSIONS.MENU_DASHBOARD,
        items: [
            { title: 'Default', icon: 'dashboard', to: '/dashboard', permission: PERMISSIONS.MENU_DASHBOARD },
            { title: 'Analytics', icon: 'chart', to: '/analytics', permission: PERMISSIONS.MENU_ANALYTICS },
        ],
    },
    {
        header: 'Monitoring',
        items: [
            { title: 'Terminals', icon: 'terminal', to: '/terminals', permission: PERMISSIONS.MENU_TERMINALS },
            { title: 'Merchants', icon: 'merchant', to: '/merchants', permission: PERMISSIONS.MENU_MERCHANTS },
            { title: 'Transactions', icon: 'receipt', to: '/transactions', permission: PERMISSIONS.MENU_TRANSACTIONS },
        ],
    },
    {
        header: 'Support',
        permission: PERMISSIONS.MENU_HELPDESK,
        items: [
            {
                title: 'Helpdesk',
                icon: 'support',
                permission: PERMISSIONS.MENU_HELPDESK,
                children: [
                    { title: 'All Tickets', icon: 'dot', to: '/helpdesk' },
                    { title: 'Open', icon: 'dot', to: '/helpdesk/status/open' },
                    { title: 'In Progress', icon: 'dot', to: '/helpdesk/status/in-progress' },
                    { title: 'Resolved', icon: 'dot', to: '/helpdesk/status/resolved' },
                ]
            },
        ],
    },
    {
        header: 'Settings',
        permission: PERMISSIONS.MENU_SETTINGS,
        items: [
            { title: 'Settings', icon: 'settings', to: '/settings', permission: PERMISSIONS.MENU_SETTINGS },
        ],
    },
    {
        header: 'Admin',
        permission: PERMISSIONS.MENU_ADMIN,
        items: [
            { title: 'Users', icon: 'users', to: '/admin/users', permission: PERMISSIONS.MENU_ADMIN },
            { title: 'Roles', icon: 'shield', to: '/admin/roles', permission: PERMISSIONS.MENU_ADMIN },
        ],
    },
];

// Icon components for navigation
const icons: Record<string, (props?: { class?: string }) => JSX.Element> = {
    dashboard: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    chart: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    terminal: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    receipt: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    merchant: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
    ),
    support: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    settings: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    dot: (props) => (
        <svg class={props?.class || "w-1.5 h-1.5"} viewBox="0 0 8 8" fill="currentColor">
            <circle cx="4" cy="4" r="3" />
        </svg>
    ),
    chevron: (props) => (
        <svg class={props?.class || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    logout: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    users: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    shield: (props) => (
        <svg class={props?.class || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
};

// Nusacita Logo - user provided SVG
// Nusacita Logo - Double Parallelogram/Chevron
function NusacitaLogo(props: { collapsed?: boolean }) {
    return (
        <div class="flex items-center gap-2">
            <div class="w-8 h-auto flex items-center justify-center flex-shrink-0">
                <img src="/images/android-chrome-192x192.png" alt="Nusacita Logo" class="w-8 h-8 rounded-sm" />
            </div>
            <Show when={!props.collapsed}>
                <span class="text-lg font-semibold text-gray-800 text-popp">nusacita</span>
            </Show>
        </div>
    );
}

// Sub menu item - compact
function SubMenuItem(props: { item: NavItem }) {
    const location = useLocation();
    const isActive = () => props.item.to ? location.pathname === props.item.to : false;

    return (
        <A
            href={props.item.to || '#'}
            class={cn(
                'flex items-center gap-2 py-1.5 pl-10 pr-3 cursor-pointer',
                'transition-colors duration-150 ease-in-out',
                'text-[13px] rounded-md',
                isActive()
                    ? 'text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-900'
            )}
        >
            <span class="text-gray-400">•</span>
            <span>{props.item.title}</span>
        </A>
    );
}

// Nav Item with submenu
function NavItemComponent(props: {
    item: NavItem;
    collapsed: boolean;
    expandedMenus: Set<string>;
    onToggleExpand: (title: string) => void;
}) {
    const location = useLocation();
    const hasChildren = () => props.item.children && props.item.children.length > 0;

    const isActive = () => {
        if (props.item.to) {
            return location.pathname === props.item.to;
        }
        if (hasChildren()) {
            return props.item.children!.some(child => child.to && location.pathname === child.to);
        }
        return false;
    };

    const isExpanded = () => props.expandedMenus.has(props.item.title);
    const IconComponent = icons[props.item.icon];

    const handleClick = (e: MouseEvent) => {
        if (hasChildren()) {
            e.preventDefault();
            props.onToggleExpand(props.item.title);
        }
    };

    const baseClasses = cn(
        'group flex items-center gap-3 rounded-lg cursor-pointer w-full',
        'transition-all duration-150 ease-in-out',
        'text-sm',
        props.collapsed ? 'p-2 justify-center' : 'px-3 py-2',
        isActive() && !hasChildren()
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    );

    const content = (
        <>
            <span class={cn(
                'flex-shrink-0 transition-colors duration-150',
                isActive() ? 'text-primary' : 'text-gray-500'
            )}>
                {IconComponent && <IconComponent />}
            </span>

            <Show when={!props.collapsed}>
                <span class="flex-1">{props.item.title}</span>

                <Show when={hasChildren()}>
                    <span class={cn(
                        'transition-transform duration-200',
                        isExpanded() ? 'rotate-180' : 'rotate-0'
                    )}>
                        {icons.chevron && icons.chevron({ class: 'w-4 h-4 text-gray-400' })}
                    </span>
                </Show>
            </Show>
        </>
    );

    return (
        <div>
            {hasChildren() ? (
                <button
                    type="button"
                    onClick={handleClick}
                    class={baseClasses}
                    title={props.collapsed ? props.item.title : undefined}
                >
                    {content}
                </button>
            ) : (
                <A
                    href={props.item.to || '#'}
                    class={baseClasses}
                    title={props.collapsed ? props.item.title : undefined}
                >
                    {content}
                </A>
            )}

            {/* Submenu - smooth slide */}
            <Show when={hasChildren() && !props.collapsed}>
                <div class={cn(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    isExpanded() ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
                )}>
                    <For each={props.item.children}>
                        {(child) => <SubMenuItem item={child} />}
                    </For>
                </div>
            </Show>
        </div>
    );
}

export function Sidebar(props: SidebarProps) {
    const collapsed = () => props.collapsed ?? false;
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = createSignal<Set<string>>(new Set());

    // Get user context for permission filtering
    let userContext: ReturnType<typeof useUser> | null = null;
    try {
        userContext = useUser();
    } catch (e) {
        // UserProvider not available, show all menus (for development)
        console.warn('UserProvider not available, showing all menus');
    }

    // Filter navigation based on user permissions
    const filteredNavigation = createMemo(() => {
        // If no user context or user is Admin, show all
        if (!userContext || userContext.user()?.role?.name === 'Admin') {
            return navigation;
        }

        const hasPermission = userContext.hasPermission;

        return navigation
            .map(group => {
                // Check group permission
                if (group.permission && !hasPermission(group.permission)) {
                    return null;
                }

                // Filter items within the group
                const filteredItems = group.items.filter(item => {
                    if (!item.permission) return true;
                    return hasPermission(item.permission);
                });

                if (filteredItems.length === 0) return null;

                return { ...group, items: filteredItems };
            })
            .filter((group): group is NavGroup => group !== null);
    });

    onMount(() => {
        try {
            const saved = localStorage.getItem('sidebar-expanded-menus');
            if (saved) {
                setExpandedMenus(new Set(JSON.parse(saved) as string[]));
            }
        } catch (e) {
            console.warn('Failed to load sidebar state:', e);
        }

        // Auto-expand active menu
        navigation.forEach(group => {
            group.items.forEach(item => {
                if (item.children?.some(child => child.to && location.pathname === child.to)) {
                    setExpandedMenus(prev => new Set([...prev, item.title]));
                }
            });
        });
    });

    createEffect(() => {
        try {
            localStorage.setItem('sidebar-expanded-menus', JSON.stringify([...expandedMenus()]));
        } catch (e) {
            console.warn('Failed to save sidebar state:', e);
        }
    });

    const toggleExpand = (title: string) => {
        setExpandedMenus(prev => {
            const next = new Set(prev);
            next.has(title) ? next.delete(title) : next.add(title);
            return next;
        });
    };

    // Shared navigation content
    const NavigationContent = (props: { isMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div class={cn(
                'h-14 flex items-center border-b border-gray-100',
                collapsed() && !props.isMobile ? 'justify-center px-2' : 'px-4'
            )}>
                <NusacitaLogo collapsed={collapsed() && !props.isMobile} />
            </div>

            {/* Navigation */}
            <nav class="flex-1 overflow-y-auto py-3 px-3">
                <For each={filteredNavigation()}>
                    {(group) => (
                        <div class="mb-4">
                            <Show when={group.header && (!collapsed() || props.isMobile)}>
                                <p class="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    {group.header}
                                </p>
                            </Show>

                            <div class="space-y-0.5">
                                <For each={group.items}>
                                    {(item) => (
                                        <NavItemComponent
                                            item={item}
                                            collapsed={collapsed() && !props.isMobile}
                                            expandedMenus={expandedMenus()}
                                            onToggleExpand={toggleExpand}
                                        />
                                    )}
                                </For>
                            </div>
                        </div>
                    )}
                </For>
            </nav>

            {/* Logout Button */}
            <div class={cn(
                'border-t border-gray-100 p-3',
                collapsed() && !props.isMobile ? 'flex justify-center' : ''
            )}>
                <button
                    type="button"
                    onClick={async () => {
                        await logoutAction();
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('pjp_user');
                            localStorage.removeItem('pjp_token');
                            window.location.href = '/login';
                        }
                    }}
                    class={cn(
                        'flex items-center gap-3 rounded-lg cursor-pointer w-full',
                        'transition-all duration-150 ease-in-out',
                        'text-sm text-gray-600 hover:bg-red-50 hover:text-red-600',
                        collapsed() && !props.isMobile ? 'p-2 justify-center' : 'px-3 py-2'
                    )}
                    title={collapsed() && !props.isMobile ? 'Logout' : undefined}
                >
                    <span class="flex-shrink-0 text-gray-500">
                        {icons.logout && <icons.logout />}
                    </span>
                    <Show when={!collapsed() || props.isMobile}>
                        <span>Logout</span>
                    </Show>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                class={cn(
                    'fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100',
                    'transition-all duration-300 ease-in-out z-40',
                    'hidden lg:flex flex-col',
                    collapsed() ? 'w-16' : 'w-64'
                )}
            >
                <NavigationContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
                class={cn(
                    'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300',
                    props.mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={props.onMobileClose}
            />

            {/* Mobile Sidebar */}
            <aside
                class={cn(
                    'fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100',
                    'transition-transform duration-300 ease-in-out z-50',
                    'flex flex-col lg:hidden',
                    props.mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <NavigationContent isMobile />
            </aside>
        </>
    );
}

export default Sidebar;
