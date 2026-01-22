/**
 * Topbar Component
 * Berry Vue styled header bar
 */

import { createSignal, Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';
import { IconButton, Avatar, Menu, type MenuItem } from '~/components/ui';
import { useUser } from '~/context/UserContext';
import { logoutAction } from '~/lib/server/actions.server';

export interface TopbarProps {
    onMenuClick?: () => void;
    onSidebarToggle?: () => void;
    sidebarCollapsed?: boolean;
}

export function Topbar(props: TopbarProps) {
    const { user } = useUser();
    const [showSearch, setShowSearch] = createSignal(false);
    const [searchQuery, setSearchQuery] = createSignal('');

    const handleLogout = async () => {
        await logoutAction();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pjp_user');
            localStorage.removeItem('pjp_token');
            window.location.href = '/login';
        }
    };

    // Profile menu items - use getter to avoid SSR hydration mismatch with JSX elements
    const getProfileItems = (): MenuItem[] => [
        { label: 'Profile', icon: <UserIcon />, onClick: () => console.log('Profile') },
        { label: 'Settings', icon: <SettingsIcon />, onClick: () => console.log('Settings') },
        { divider: true, label: '' },
        { label: 'Logout', icon: <LogoutIcon />, onClick: handleLogout },
    ];

    // Notification items
    const notificationItems: MenuItem[] = [
        { label: 'New terminal offline', onClick: () => { } },
        { label: 'Transaction failed', onClick: () => { } },
        { label: 'SLA breach detected', onClick: () => { } },
        { divider: true, label: '' },
        { label: 'View all notifications', onClick: () => { } },
    ];

    return (
        <header
            class={cn(
                'fixed top-0 right-0 h-14 bg-white border-b border-gray-100 z-30',
                'flex items-center justify-between px-4',
                'transition-all duration-300',
                'left-0',
                props.sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
            )}
        >
            {/* Left side */}
            <div class="flex items-center gap-3">
                {/* Mobile menu toggle */}
                <IconButton
                    color="secondary"
                    variant="flat"
                    size="sm"
                    rounded="sm"
                    onClick={props.onMenuClick}
                    class="lg:hidden"
                    aria-label="Toggle menu"
                >
                    <MenuIcon />
                </IconButton>

                {/* Desktop sidebar toggle */}
                <IconButton
                    color="secondary"
                    variant="flat"
                    size="sm"
                    rounded="sm"
                    onClick={props.onSidebarToggle}
                    class="hidden lg:flex"
                    aria-label="Toggle sidebar"
                >
                    <MenuIcon />
                </IconButton>

                {/* Mobile search toggle */}
                <IconButton
                    color="secondary"
                    variant="flat"
                    size="sm"
                    rounded="sm"
                    onClick={() => setShowSearch(!showSearch())}
                    class="lg:hidden"
                    aria-label="Toggle search"
                >
                    <span class="text-sm">🔍</span>
                </IconButton>

                {/* Desktop search */}
                <div class="hidden lg:block relative">
                    <div class="flex items-center bg-gray-50 rounded-md border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        <span class="pl-3 text-lightText text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery()}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            class="w-64 py-2 px-3 bg-transparent border-0 outline-none text-sm text-darkText placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile search overlay */}
            <Show when={showSearch()}>
                <div class="fixed inset-x-0 top-topbar p-4 bg-surface shadow-berry-md lg:hidden">
                    <div class="flex items-center bg-gray-50 rounded-md border border-gray-200">
                        <span class="pl-3 text-lightText text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery()}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            class="flex-1 py-2 px-3 bg-transparent border-0 outline-none text-sm"
                            autofocus
                        />
                        <button
                            onClick={() => setShowSearch(false)}
                            class="pr-3 text-lightText hover:text-darkText"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </Show>

            {/* Right side */}
            <div class="flex items-center gap-2">
                {/* Notifications */}
                <Menu
                    trigger={
                        <IconButton
                            color="secondary"
                            variant="flat"
                            size="sm"
                            rounded="sm"
                            aria-label="Notifications"
                        >
                            <BellIcon />
                        </IconButton>
                    }
                    items={notificationItems}
                    placement="bottom-end"
                    width={280}
                />

                {/* Profile */}
                <Menu
                    trigger={
                        <button class={cn(
                            'flex items-center gap-2 px-2 py-1.5',
                            'bg-primary-light text-primary rounded-pill',
                            'hover:bg-primary-200 transition-colors'
                        )}>
                            <Avatar
                                name={user()?.name || 'Admin User'}
                                size="sm"
                                color="primary"
                            />
                            <SettingsIconSmall />
                        </button>
                    }
                    items={getProfileItems()}
                    placement="bottom-end"
                    width={200}
                />
            </div>
        </header>
    );
}

// Icon components
function MenuIcon() {
    return (
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function SettingsIconSmall() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}

export default Topbar;
