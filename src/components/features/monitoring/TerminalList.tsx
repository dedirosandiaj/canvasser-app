/**
 * Terminal List Component
 * Berry Vue styled terminal status display
 */

import { createSignal, For, Show, createMemo } from 'solid-js';
import { cn } from '~/lib/utils/cn';
import { StatusBadge, TextField } from '~/components/ui';
import type { Terminal, TerminalStatus } from '~/types';
import { formatRelativeTime } from '~/lib/utils/format';

export interface TerminalListProps {
    terminals: Terminal[];
    maxItems?: number;
    showSearch?: boolean;
    showFilter?: boolean;
    class?: string;
}

const statusOrder: Record<TerminalStatus, number> = {
    OFFLINE: 0,
    ERROR: 1,
    LOW_PAPER: 2,
    MAINTENANCE: 3,
    ONLINE: 4,
};

type FilterStatus = 'all' | TerminalStatus;

export function TerminalList(props: TerminalListProps) {
    const [search, setSearch] = createSignal('');
    const [statusFilter, setStatusFilter] = createSignal<FilterStatus>('all');

    const showSearch = () => props.showSearch ?? true;
    const showFilter = () => props.showFilter ?? true;
    const maxItems = () => props.maxItems ?? 10;

    // Filter and sort terminals
    const filteredTerminals = createMemo(() => {
        let result = [...props.terminals];

        // Filter by status
        if (statusFilter() !== 'all') {
            result = result.filter(t => t.status === statusFilter());
        }

        // Filter by search
        if (search()) {
            const query = search().toLowerCase();
            result = result.filter(t =>
                t.id.toLowerCase().includes(query) ||
                t.merchant_id.toLowerCase().includes(query) ||
                t.merchant_name?.toLowerCase().includes(query) ||
                t.location?.city?.toLowerCase().includes(query)
            );
        }

        // Sort by status priority (offline/error first)
        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

        return result.slice(0, maxItems());
    });

    // Status counts
    const statusCounts = createMemo(() => {
        const counts: Record<string, number> = { all: props.terminals.length };
        for (const t of props.terminals) {
            counts[t.status] = (counts[t.status] || 0) + 1;
        }
        return counts;
    });

    return (
        <div class={cn('space-y-4', props.class)}>
            {/* Filters */}
            <Show when={showSearch() || showFilter()}>
                <div class="flex flex-col sm:flex-row gap-3">
                    <Show when={showSearch()}>
                        <div class="flex-1">
                            <TextField
                                placeholder="🔍 Search terminal, merchant..."
                                value={search()}
                                onInput={(e) => setSearch(e.currentTarget.value)}
                            />
                        </div>
                    </Show>

                    <Show when={showFilter()}>
                        <div class="flex gap-2 flex-wrap">
                            <For each={['all', 'ONLINE', 'OFFLINE', 'LOW_PAPER', 'ERROR'] as const}>
                                {(status) => (
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter(status)}
                                        class={cn(
                                            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                                            statusFilter() === status
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-lightText hover:bg-gray-200'
                                        )}
                                    >
                                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                                        <span class="ml-1 opacity-70">({statusCounts()[status] || 0})</span>
                                    </button>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </Show>

            {/* Terminal list */}
            <div class="space-y-2">
                <Show
                    when={filteredTerminals().length > 0}
                    fallback={
                        <div class="text-center py-8 text-lightText">
                            <p>No terminals found</p>
                        </div>
                    }
                >
                    <For each={filteredTerminals()}>
                        {(terminal) => (
                            <div class={cn(
                                'flex items-center gap-4 p-4 rounded-md bg-gray-50',
                                'hover:bg-gray-100 transition-colors cursor-pointer'
                            )}>
                                {/* Status indicator */}
                                <div class={cn(
                                    'w-2 h-2 rounded-full flex-shrink-0',
                                    terminal.status === 'ONLINE' && 'bg-success',
                                    terminal.status === 'OFFLINE' && 'bg-error',
                                    terminal.status === 'LOW_PAPER' && 'bg-warning',
                                    terminal.status === 'ERROR' && 'bg-error',
                                    terminal.status === 'MAINTENANCE' && 'bg-gray-400'
                                )} />

                                {/* Terminal info */}
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-darkText">{terminal.id}</span>
                                        <StatusBadge status={terminal.status} size="sm" />
                                    </div>
                                    <p class="text-sm text-lightText truncate">
                                        {terminal.merchant_name} • {terminal.location?.city}
                                    </p>
                                </div>

                                {/* Last activity */}
                                <div class="text-right text-sm text-lightText hidden sm:block">
                                    <p>Last transaction</p>
                                    <p class="font-medium text-darkText">
                                        {formatRelativeTime(terminal.last_seen)}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </For>
                </Show>
            </div>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

export default TerminalList;
