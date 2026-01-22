/**
 * TextField Component
 * Berry Vue styled input with validation states and icons
 */

import { JSX, Show, createSignal, splitProps, createUniqueId } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type ValidationState = 'default' | 'error' | 'success' | 'warning';
export type TextFieldVariant = 'outlined' | 'filled' | 'standard';

export interface TextFieldProps {
    label?: string;
    placeholder?: string;
    value?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time' | 'date' | 'datetime-local' | 'month' | 'week';
    variant?: TextFieldVariant;
    validation?: ValidationState;
    helperText?: string;
    errorText?: string;
    prefix?: JSX.Element;
    suffix?: JSX.Element;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    fullWidth?: boolean;
    maxLength?: number;
    minLength?: number;
    class?: string;
    inputClass?: string;
    onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
    onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
    onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
    id?: string;
    name?: string;
}

const validationStyles: Record<ValidationState, { border: string; text: string; bg: string }> = {
    default: {
        border: 'border-borderLight focus-within:border-primary',
        text: 'text-lightText',
        bg: '',
    },
    error: {
        border: 'border-error focus-within:border-error',
        text: 'text-error',
        bg: 'bg-error-50',
    },
    success: {
        border: 'border-success focus-within:border-success',
        text: 'text-success',
        bg: '',
    },
    warning: {
        border: 'border-warning focus-within:border-warning',
        text: 'text-warning-700',
        bg: 'bg-warning-50',
    },
};

export function TextField(props: TextFieldProps) {
    const [focused, setFocused] = createSignal(false);

    const variant = () => props.variant ?? 'outlined';
    const validation = () => props.validation ?? 'default';
    const validationConfig = () => validationStyles[validation()];

    const defaultId = createUniqueId();
    const inputId = () => props.id || props.name || `textfield-${defaultId}`;

    const handleFocus = (e: FocusEvent & { currentTarget: HTMLInputElement }) => {
        setFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent & { currentTarget: HTMLInputElement }) => {
        setFocused(false);
        props.onBlur?.(e);
    };

    const getVariantStyles = () => {
        switch (variant()) {
            case 'filled':
                return 'bg-gray-100 border-b-2 border-t-0 border-l-0 border-r-0 rounded-t-md rounded-b-none';
            case 'standard':
                return 'bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 rounded-none';
            default:
                return 'bg-surface border rounded-md';
        }
    };

    return (
        <div class={cn('flex flex-col gap-1.5', props.fullWidth && 'w-full', props.class)}>
            {/* Label */}
            <Show when={props.label}>
                <label
                    for={inputId()}
                    class={cn(
                        'text-sm font-medium',
                        props.disabled ? 'text-gray-400' : 'text-darkText'
                    )}
                >
                    {props.label}
                    <Show when={props.required}>
                        <span class="text-error ml-0.5">*</span>
                    </Show>
                </label>
            </Show>

            {/* Input container */}
            <div
                class={cn(
                    'flex items-center gap-2',
                    'transition-all duration-200',
                    getVariantStyles(),
                    validationConfig().border,
                    validation() === 'error' && 'bg-error-50/50',
                    focused() && 'ring-2 ring-primary/20',
                    props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
                )}
            >
                {/* Prefix */}
                <Show when={props.prefix}>
                    <span class="pl-3 flex-shrink-0 text-lightText">{props.prefix}</span>
                </Show>

                {/* Input */}
                <input
                    id={inputId()}
                    name={props.name}
                    type={props.type ?? 'text'}
                    value={props.value}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    readonly={props.readonly}
                    required={props.required}
                    maxLength={props.maxLength}
                    minLength={props.minLength}
                    onInput={props.onInput}
                    onChange={props.onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    class={cn(
                        'flex-1 w-full py-2.5 px-3 bg-transparent',
                        'text-darkText placeholder:text-gray-400',
                        'outline-none border-0',
                        'text-sm',
                        !props.prefix && 'pl-3',
                        !props.suffix && 'pr-3',
                        props.inputClass
                    )}
                />

                {/* Suffix */}
                <Show when={props.suffix}>
                    <span class="pr-3 flex-shrink-0 text-lightText">{props.suffix}</span>
                </Show>
            </div>

            {/* Helper / Error text */}
            <Show when={props.errorText || props.helperText}>
                <p class={cn(
                    'text-xs',
                    props.errorText ? validationConfig().text : 'text-lightText'
                )}>
                    {props.errorText || props.helperText}
                </p>
            </Show>
        </div>
    );
}

export default TextField;
