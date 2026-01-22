/**
 * Menu Component
 * Dropdown menu with Berry Vue styling
 */

import { JSX, Show, createSignal, createEffect, onCleanup, onMount, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import { cn } from '~/lib/utils/cn';

export interface MenuItem {
    label: string;
    icon?: JSX.Element;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
}

export interface MenuProps {
    trigger: JSX.Element;
    items: MenuItem[];
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    width?: string | number;
    class?: string;
}

export function Menu(props: MenuProps) {
    const [open, setOpen] = createSignal(false);
    const [mounted, setMounted] = createSignal(false);
    const [position, setPosition] = createSignal({ top: 0, left: 0 });
    let triggerRef: HTMLDivElement | undefined;
    let menuRef: HTMLDivElement | undefined;

    // Only show portal after mounting to avoid SSR hydration issues
    onMount(() => {
        setMounted(true);
    });

    const placement = () => props.placement ?? 'bottom-start';

    const updatePosition = () => {
        if (!triggerRef) return;

        const rect = triggerRef.getBoundingClientRect();
        const menuWidth = menuRef?.offsetWidth || 150;
        const menuHeight = menuRef?.offsetHeight || 200;

        let top = rect.bottom + 4;
        let left = rect.left;

        const p = placement();
        if (p.includes('end')) {
            left = rect.right - menuWidth;
        }
        if (p.includes('top')) {
            top = rect.top - menuHeight - 4;
        }

        // Keep within viewport
        if (left < 8) left = 8;
        if (left + menuWidth > window.innerWidth - 8) {
            left = window.innerWidth - menuWidth - 8;
        }
        if (top + menuHeight > window.innerHeight - 8) {
            top = rect.top - menuHeight - 4;
        }

        setPosition({ top, left });
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (
            menuRef && !menuRef.contains(e.target as Node) &&
            triggerRef && !triggerRef.contains(e.target as Node)
        ) {
            setOpen(false);
        }
    };

    createEffect(() => {
        if (open()) {
            updatePosition();
            document.addEventListener('click', handleClickOutside);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }

        onCleanup(() => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        });
    });

    const handleItemClick = (item: MenuItem) => {
        if (!item.disabled && !item.divider) {
            item.onClick?.();
            setOpen(false);
        }
    };

    return (
        <>
            <div
                ref={triggerRef}
                onClick={() => setOpen(!open())}
                class="inline-block"
            >
                {props.trigger}
            </div>

            <Show when={mounted() && open()}>
                <Portal>
                    <div
                        ref={menuRef}
                        class={cn(
                            'fixed z-50 py-2 bg-surface rounded-md shadow-berry-lg border border-gray-100',
                            'animate-slide-up',
                            props.class
                        )}
                        style={{
                            top: `${position().top}px`,
                            left: `${position().left}px`,
                            width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : 'auto',
                            'min-width': '150px',
                        }}
                    >
                        <For each={props.items}>
                            {(item) => (
                                <Show
                                    when={!item.divider}
                                    fallback={<div class="h-px bg-gray-100 my-1" />}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleItemClick(item)}
                                        disabled={item.disabled}
                                        class={cn(
                                            'w-full flex items-center gap-3 px-4 py-2 text-left text-sm',
                                            'hover:bg-gray-50 transition-colors',
                                            item.disabled && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <Show when={item.icon}>
                                            <span class="flex-shrink-0 text-lightText">{item.icon}</span>
                                        </Show>
                                        <span class="text-darkText">{item.label}</span>
                                    </button>
                                </Show>
                            )}
                        </For>
                    </div>
                </Portal>
            </Show>
        </>
    );
}

export default Menu;
