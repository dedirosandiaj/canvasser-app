/**
 * DataTable Component
 * Berry Vue styled data table with pagination, sorting, and selection
 */

import { JSX, For, Show, createSignal, createMemo } from 'solid-js';
import { cn } from '~/lib/utils/cn';
import { Button, TextField, Skeleton } from '~/components/ui';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
    key: string;
    direction: SortDirection;
}

export interface PaginationState {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

export interface DataTableColumn<T extends object> {
    key: keyof T | string;
    header: string;
    width?: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (row: T, index: number) => JSX.Element;
    align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T extends object> {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: keyof T;

    // Pagination
    pagination?: PaginationState;
    onPageChange?: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;

    // Sorting
    sort?: SortState;
    onSort?: (sort: SortState) => void;

    // Selection
    selectable?: boolean;
    selectedRows?: (string | number)[];
    onSelectionChange?: (selected: (string | number)[]) => void;

    // Search
    searchable?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;

    // States
    loading?: boolean;
    emptyMessage?: string;

    // Styling
    striped?: boolean;
    hoverable?: boolean;
    stickyHeader?: boolean;
    class?: string;

    // Row click
    onRowClick?: (row: T, index: number) => void;
}

// Pagination options
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T extends object>(props: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = createSignal('');

    // Default values
    const striped = () => props.striped ?? false;
    const hoverable = () => props.hoverable ?? true;
    const emptyMessage = () => props.emptyMessage ?? 'No data available';

    // All row keys
    const allRowKeys = createMemo(() =>
        props.data.map(row => row[props.rowKey] as string | number)
    );

    // Check if all visible rows are selected
    const allSelected = createMemo(() => {
        if (!props.selectable || props.data.length === 0) return false;
        return allRowKeys().every(key => props.selectedRows?.includes(key));
    });

    // Toggle all selection
    const toggleAll = () => {
        if (!props.onSelectionChange) return;

        if (allSelected()) {
            props.onSelectionChange([]);
        } else {
            props.onSelectionChange([...allRowKeys()]);
        }
    };

    // Toggle single row selection
    const toggleRow = (key: string | number) => {
        if (!props.onSelectionChange || !props.selectedRows) return;

        const newSelection = props.selectedRows.includes(key)
            ? props.selectedRows.filter(k => k !== key)
            : [...props.selectedRows, key];

        props.onSelectionChange(newSelection);
    };

    // Handle sort
    const handleSort = (column: DataTableColumn<T>) => {
        if (!column.sortable || !props.onSort) return;

        const key = String(column.key);
        const direction: SortDirection =
            props.sort?.key === key && props.sort.direction === 'asc'
                ? 'desc'
                : 'asc';

        props.onSort({ key, direction });
    };

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        props.onSearch?.(query);
    };

    // Get cell value
    const getCellValue = (row: T, column: DataTableColumn<T>): unknown => {
        const keys = String(column.key).split('.');
        let value: unknown = row;
        for (const key of keys) {
            value = (value as Record<string, unknown>)?.[key];
        }
        return value;
    };

    return (
        <div class={cn('bg-surface rounded-md shadow-card overflow-hidden', props.class)}>
            {/* Search bar */}
            <Show when={props.searchable}>
                <div class="p-4 border-b border-gray-100">
                    <div class="max-w-sm relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder={props.searchPlaceholder ?? 'Search...'}
                            value={searchQuery()}
                            onInput={(e) => handleSearch(e.currentTarget.value)}
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        />
                    </div>
                </div>
            </Show>

            {/* Table */}
            <div class="overflow-x-auto">
                <table class="w-full">
                    {/* Header */}
                    <thead class={cn(
                        'bg-gray-50 border-b border-gray-100',
                        props.stickyHeader && 'sticky top-0 z-10'
                    )}>
                        <tr>
                            {/* Selection checkbox */}
                            <Show when={props.selectable}>
                                <th class="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected()}
                                        onChange={toggleAll}
                                        class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                            </Show>

                            {/* Column headers */}
                            <For each={props.columns}>
                                {(column) => (
                                    <th
                                        class={cn(
                                            'px-4 py-3 text-left text-xs font-semibold text-lightText uppercase tracking-wider',
                                            column.sortable && 'cursor-pointer select-none hover:text-darkText',
                                            column.align === 'center' && 'text-center',
                                            column.align === 'right' && 'text-right'
                                        )}
                                        style={{ width: column.width }}
                                        onClick={() => column.sortable && handleSort(column)}
                                    >
                                        <div class={cn(
                                            'flex items-center gap-1',
                                            column.align === 'center' && 'justify-center',
                                            column.align === 'right' && 'justify-end'
                                        )}>
                                            <span>{column.header}</span>
                                            <Show when={column.sortable}>
                                                <SortIcon
                                                    active={props.sort?.key === column.key}
                                                    direction={props.sort?.key === column.key ? props.sort.direction : undefined}
                                                />
                                            </Show>
                                        </div>
                                    </th>
                                )}
                            </For>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody class="divide-y divide-gray-100">
                        {/* Loading state */}
                        <Show when={props.loading}>
                            <For each={Array(5).fill(null)}>
                                {() => (
                                    <tr>
                                        <Show when={props.selectable}>
                                            <td class="px-4 py-3">
                                                <Skeleton width={16} height={16} variant="rounded" />
                                            </td>
                                        </Show>
                                        <For each={props.columns}>
                                            {() => (
                                                <td class="px-4 py-3">
                                                    <Skeleton width="80%" height={16} />
                                                </td>
                                            )}
                                        </For>
                                    </tr>
                                )}
                            </For>
                        </Show>

                        {/* Empty state */}
                        <Show when={!props.loading && props.data.length === 0}>
                            <tr>
                                <td
                                    colspan={props.columns.length + (props.selectable ? 1 : 0)}
                                    class="px-4 py-12 text-center text-lightText"
                                >
                                    <div class="flex flex-col items-center gap-2">
                                        <EmptyIcon />
                                        <p class="text-sm">{emptyMessage()}</p>
                                    </div>
                                </td>
                            </tr>
                        </Show>

                        {/* Data rows */}
                        <Show when={!props.loading && props.data.length > 0}>
                            <For each={props.data}>
                                {(row, index) => {
                                    const rowKey = row[props.rowKey] as string | number;
                                    const isSelected = () => props.selectedRows?.includes(rowKey);

                                    return (
                                        <tr
                                            class={cn(
                                                'transition-colors',
                                                striped() && index() % 2 === 1 && 'bg-gray-50/50',
                                                hoverable() && 'hover:bg-gray-50',
                                                isSelected() && 'bg-primary-50',
                                                props.onRowClick && 'cursor-pointer'
                                            )}
                                            onClick={() => props.onRowClick?.(row, index())}
                                        >
                                            {/* Selection checkbox */}
                                            <Show when={props.selectable}>
                                                <td class="w-12 px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected()}
                                                        onChange={() => toggleRow(rowKey)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </td>
                                            </Show>

                                            {/* Cells */}
                                            <For each={props.columns}>
                                                {(column) => (
                                                    <td
                                                        class={cn(
                                                            'px-4 py-3 text-sm text-darkText',
                                                            column.align === 'center' && 'text-center',
                                                            column.align === 'right' && 'text-right'
                                                        )}
                                                    >
                                                        <Show
                                                            when={column.render}
                                                            fallback={<span>{String(getCellValue(row, column) ?? '-')}</span>}
                                                        >
                                                            {column.render!(row, index())}
                                                        </Show>
                                                    </td>
                                                )}
                                            </For>
                                        </tr>
                                    );
                                }}
                            </For>
                        </Show>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Show when={props.pagination && !props.loading}>
                <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    {/* Per page selector */}
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-lightText">Rows per page:</span>
                        <select
                            value={props.pagination!.perPage}
                            onChange={(e) => props.onPerPageChange?.(Number(e.currentTarget.value))}
                            class="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-darkText text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <For each={PER_PAGE_OPTIONS}>
                                {(option) => <option value={option}>{option}</option>}
                            </For>
                        </select>
                    </div>

                    {/* Page info */}
                    <div class="text-sm text-lightText">
                        <span>
                            {((props.pagination!.page - 1) * props.pagination!.perPage) + 1}-
                            {Math.min(props.pagination!.page * props.pagination!.perPage, props.pagination!.total)}
                        </span>
                        <span> of </span>
                        <span>{props.pagination!.total}</span>
                    </div>

                    {/* Page buttons */}
                    <div class="flex items-center gap-1">
                        <Button
                            variant="text"
                            color="gray"
                            size="sm"
                            disabled={props.pagination!.page <= 1}
                            onClick={() => props.onPageChange?.(props.pagination!.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="text"
                            color="gray"
                            size="sm"
                            disabled={props.pagination!.page >= props.pagination!.totalPages}
                            onClick={() => props.onPageChange?.(props.pagination!.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Show>
        </div>
    );
}

// Icons
function SearchIcon() {
    return (
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function SortIcon(props: { active?: boolean; direction?: SortDirection }) {
    return (
        <svg class={cn('w-4 h-4', props.active ? 'text-primary' : 'text-gray-400')} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d={props.direction === 'asc' ? 'M5 15l7-7 7 7' : props.direction === 'desc' ? 'M19 9l-7 7-7-7' : 'M8 9l4-4 4 4M16 15l-4 4-4-4'}
                opacity={props.active ? 1 : 0.5}
            />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg class="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

export default DataTable;
