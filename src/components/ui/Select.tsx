import { JSX, splitProps, createUniqueId, Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    helperText?: string;
    errorText?: string;
    fullWidth?: boolean;
    containerClass?: string;
}

export function Select(props: SelectProps) {
    const [local, others] = splitProps(props, [
        'label',
        'helperText',
        'errorText',
        'fullWidth',
        'class',
        'containerClass',
        'children',
        'required',
        'disabled',
        'id',
        'name'
    ]);

    const defaultId = createUniqueId();
    const selectId = () => local.id || local.name || `select-${defaultId}`;

    return (
        <div class={cn('flex flex-col gap-1.5', local.fullWidth && 'w-full', local.containerClass)}>
            {/* Label */}
            <Show when={local.label}>
                <label
                    for={selectId()}
                    class={cn(
                        'text-sm font-medium',
                        local.disabled ? 'text-gray-400' : 'text-gray-900'
                    )}
                >
                    {local.label}
                    <Show when={local.required}>
                        <span class="text-red-500 ml-0.5">*</span>
                    </Show>
                </label>
            </Show>

            <div class="relative">
                <select
                    id={selectId()}
                    disabled={local.disabled}
                    required={local.required}
                    class={cn(
                        'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md',
                        'text-base',
                        !props.value || props.value === "" ? 'text-gray-400' : 'text-gray-900', // Placeholder color if empty
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        'transition-colors',
                        'appearance-none', // Hide default arrow
                        'bg-no-repeat', 
                        local.disabled && 'opacity-50 cursor-not-allowed',
                        local.class
                    )}
                    {...others}
                >
                    {local.children}
                </select>

                {/* Dropdown Arrow */}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                     </svg>
                </span>
            </div>

            {/* Helper text */}
            <Show when={local.errorText || local.helperText}>
                <p class={cn('text-xs', local.errorText ? 'text-red-500' : 'text-gray-500')}>
                    {local.errorText || local.helperText}
                </p>
            </Show>
        </div>
    );
}

export default Select;
