/**
 * Autocomplete Component
 * Reusable autocomplete with client-side filtering and keyboard navigation
 */

import { createSignal, createMemo, For, Show, onMount, onCleanup } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export interface AutocompleteOption {
    value: string;
    label: string;
    sublabel?: string;
}

export interface AutocompleteProps {
    options: AutocompleteOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function Autocomplete(props: AutocompleteProps) {
    let inputRef: HTMLInputElement | undefined;
    let containerRef: HTMLDivElement | undefined;

    const [isOpen, setIsOpen] = createSignal(false);
    const [query, setQuery] = createSignal('');
    const [highlightedIndex, setHighlightedIndex] = createSignal(0);

    // Get display value for the selected value
    const displayValue = createMemo(() => {
        if (!props.value) return '';
        const option = props.options.find(o => o.value === props.value);
        
        if (!option) return props.value;

        // If label and value are same, show just one.
        if (option.value === option.label) {
            return option.label;
        }

        return `${option.value} - ${option.label}`;
    });

    // Filtered options based on query
    const filteredOptions = createMemo(() => {
        const q = query().toLowerCase();
        if (!q) return props.options.slice(0, 50); // Limit initial display
        return props.options
            .filter(o =>
                o.value.toLowerCase().includes(q) ||
                o.label.toLowerCase().includes(q) ||
                o.sublabel?.toLowerCase().includes(q)
            )
            .slice(0, 50);
    });

    // Handle input focus
    const handleFocus = () => {
        setIsOpen(true);
        setQuery('');
    };

    // Handle input change
    const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        setQuery(e.currentTarget.value);
        setHighlightedIndex(0);
        if (!isOpen()) setIsOpen(true);
    };

    // Handle option selection
    const selectOption = (option: AutocompleteOption) => {
        props.onChange(option.value);
        setIsOpen(false);
        setQuery('');
        inputRef?.blur();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen()) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(i => Math.min(i + 1, filteredOptions().length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                const option = filteredOptions()[highlightedIndex()];
                if (option) selectOption(option);
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
        if (containerRef && !containerRef.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    onMount(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('click', handleClickOutside);
        }
    });

    onCleanup(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', handleClickOutside);
        }
    });

    return (
        <div
            ref={containerRef}
            class={cn('flex flex-col gap-1.5 relative', props.fullWidth && 'w-full', props.class)}
        >
            {/* Label */}
            <Show when={props.label}>
                <label class={cn('text-sm font-medium', props.disabled ? 'text-gray-400' : 'text-gray-900')}>
                    {props.label}
                    <Show when={props.required}>
                        <span class="text-red-500 ml-0.5">*</span>
                    </Show>
                </label>
            </Show>

            {/* Input container */}
            <div class="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen() ? query() : displayValue()}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    onFocus={handleFocus}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    class={cn(
                         'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md',
                        'text-base text-gray-900 placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        'transition-colors',
                        props.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />

                {/* Dropdown indicator */}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Show when={props.loading} fallback="▼">
                        <span class="animate-spin">⏳</span>
                    </Show>
                </span>
            </div>

            {/* Dropdown */}
            <Show when={isOpen() && !props.loading}>
                <div class={cn(
                    'absolute z-50 w-full mt-1 top-full',
                    'bg-white border border-gray-200 rounded-md shadow-lg',
                    'max-h-60 overflow-y-auto'
                )}>
                    <Show
                        when={filteredOptions().length > 0}
                        fallback={
                            <div class="px-3 py-2 text-sm text-gray-500">
                                No results found
                            </div>
                        }
                    >
                        <For each={filteredOptions()}>
                            {(option, index) => (
                                <button
                                    type="button"
                                    onClick={() => selectOption(option)}
                                    onMouseEnter={() => setHighlightedIndex(index())}
                                    class={cn(
                                        'w-full px-3 py-2 text-left text-sm transition-colors',
                                        highlightedIndex() === index()
                                            ? 'bg-primary-50 text-primary'
                                            : 'text-gray-900 hover:bg-gray-50',
                                        props.value === option.value && 'font-medium'
                                    )}
                                >
                                    <div class="flex items-center justify-between">

                                        <span class="flex-1 truncate">{option.label}</span>
                                    </div>
                                    <Show when={option.sublabel}>
                                        <p class="text-xs text-gray-500 truncate">{option.sublabel}</p>
                                    </Show>
                                </button>
                            )}
                        </For>
                    </Show>
                </div>
            </Show>

            {/* Helper text */}
            <Show when={props.helperText}>
                <p class="text-xs text-gray-500">{props.helperText}</p>
            </Show>
        </div>
    );
}

export default Autocomplete;
