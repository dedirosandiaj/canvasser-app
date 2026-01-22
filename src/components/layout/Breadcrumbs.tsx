/**
 * Breadcrumbs Component
 * Berry Vue styled breadcrumb navigation
 */

import { Show, For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { cn } from '~/lib/utils/cn';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    class?: string;
}

// Route name mapping
const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    terminals: 'Terminals',
    transactions: 'Transactions',
    helpdesk: 'Helpdesk',
    settings: 'Settings',
    default: 'Default',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const parts = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    for (const part of parts) {
        // Skip route groups like (app)
        if (part.startsWith('(') && part.endsWith(')')) continue;

        currentPath += `/${part}`;
        items.push({
            label: routeNames[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
            href: currentPath,
        });
    }

    return items;
}

export function Breadcrumbs(props: BreadcrumbsProps) {
    const location = useLocation();

    const breadcrumbs = () => props.items || generateBreadcrumbs(location.pathname);
    const lastIndex = () => breadcrumbs().length - 1;

    return (
        <nav aria-label="Breadcrumb" class={cn('flex items-center', props.class)}>
            <ol class="flex items-center gap-2 text-sm">
                <For each={breadcrumbs()}>
                    {(item, index) => (
                        <>
                            <li>
                                <Show
                                    when={index() < lastIndex() && item.href}
                                    fallback={
                                        <span class="font-medium text-darkText">
                                            {item.label}
                                        </span>
                                    }
                                >
                                    <A
                                        href={item.href!}
                                        class="text-lightText hover:text-primary transition-colors"
                                    >
                                        <Show
                                            when={index() > 0}
                                            fallback={
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            }
                                        >
                                            {item.label}
                                        </Show>
                                    </A>
                                </Show>
                            </li>
                            <Show when={index() < lastIndex()}>
                                <li class="text-gray-300" aria-hidden="true">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </li>
                            </Show>
                        </>
                    )}
                </For>
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
