/**
 * TicketTimeline Component
 * Activity timeline for ticket detail view
 */

import { JSX, For, Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';
import type { TicketActivity, TicketAction } from '~/types';
import { formatDateTime, formatRelativeTime } from '~/lib/utils/format';

export interface TicketTimelineProps {
    activities: TicketActivity[];
    loading?: boolean;
    class?: string;
}

// Action icon mapping
const actionIcons: Record<TicketAction, JSX.Element> = {
    CREATED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    ),
    UPDATED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    COMMENTED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    STATUS_CHANGED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    ASSIGNED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    ESCALATED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    RESOLVED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    CLOSED: (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// Action color mapping
const actionColors: Record<TicketAction, string> = {
    CREATED: 'bg-pjp-blue-500',
    UPDATED: 'bg-pjp-gray-500',
    COMMENTED: 'bg-pjp-gray-600',
    STATUS_CHANGED: 'bg-pjp-amber-500',
    ASSIGNED: 'bg-pjp-blue-500',
    ESCALATED: 'bg-pjp-red-500',
    RESOLVED: 'bg-pjp-green-500',
    CLOSED: 'bg-pjp-gray-500',
};

// Format action text
function formatAction(activity: TicketActivity): string {
    switch (activity.action) {
        case 'CREATED':
            return 'created this ticket';
        case 'UPDATED':
            return 'updated the ticket';
        case 'COMMENTED':
            return 'added a comment';
        case 'STATUS_CHANGED':
            return `changed status from ${activity.old_value} to ${activity.new_value}`;
        case 'ASSIGNED':
            return `assigned to ${activity.new_value}`;
        case 'ESCALATED':
            return 'escalated this ticket';
        case 'RESOLVED':
            return 'resolved this ticket';
        case 'CLOSED':
            return 'closed this ticket';
        default:
            return activity.details;
    }
}

export function TicketTimeline(props: TicketTimelineProps) {
    return (
        <div class={cn('relative', props.class)}>
            {/* Loading state */}
            <Show when={props.loading}>
                <div class="space-y-4 animate-pulse">
                    {[...Array(3)].map(() => (
                        <div class="flex gap-4">
                            <div class="w-8 h-8 bg-pjp-gray-700 rounded-full" />
                            <div class="flex-1">
                                <div class="h-4 w-48 bg-pjp-gray-700 rounded mb-2" />
                                <div class="h-3 w-24 bg-pjp-gray-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </Show>

            {/* Empty state */}
            <Show when={!props.loading && props.activities.length === 0}>
                <div class="text-center py-8 text-pjp-gray-500">
                    <svg
                        class="w-12 h-12 mx-auto mb-3 text-pjp-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p>No activity yet</p>
                </div>
            </Show>

            {/* Timeline */}
            <Show when={!props.loading && props.activities.length > 0}>
                <div class="space-y-0">
                    <For each={props.activities}>
                        {(activity, index) => (
                            <div class="relative flex gap-4 pb-6 last:pb-0">
                                {/* Connector line */}
                                <Show when={index() < props.activities.length - 1}>
                                    <div class="absolute left-4 top-8 bottom-0 w-px bg-pjp-gray-700" />
                                </Show>

                                {/* Icon */}
                                <div
                                    class={cn(
                                        'relative z-10 flex items-center justify-center',
                                        'w-8 h-8 rounded-full text-white flex-shrink-0',
                                        actionColors[activity.action]
                                    )}
                                >
                                    {actionIcons[activity.action]}
                                </div>

                                {/* Content */}
                                <div class="flex-1 min-w-0 pt-0.5">
                                    <p class="text-sm text-pjp-gray-200">
                                        <span class="font-medium text-white">
                                            {activity.actor_name || activity.actor}
                                        </span>
                                        {' '}
                                        {formatAction(activity)}
                                    </p>
                                    <p class="text-xs text-pjp-gray-500 mt-1" title={formatDateTime(activity.created_at)}>
                                        {formatRelativeTime(activity.created_at)}
                                    </p>

                                    {/* Details/Comment content */}
                                    <Show when={activity.action === 'COMMENTED' && activity.details}>
                                        <div class="mt-2 p-3 bg-pjp-gray-800 rounded-lg border border-pjp-gray-700">
                                            <p class="text-sm text-pjp-gray-300 whitespace-pre-wrap">
                                                {activity.details}
                                            </p>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

export default TicketTimeline;
