/**
 * Terminal Autocomplete Component
 * Reusable component for selecting terminals with lookup
 */

import { createSignal, createMemo, onMount } from 'solid-js';
import { createAsync } from '@solidjs/router';
import { getTerminals } from '~/lib/server/data.server';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';

interface TerminalAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function TerminalAutocomplete(props: TerminalAutocompleteProps) {
    const terminalsData = createAsync(() => getTerminals(1, 500));

    const options = createMemo<AutocompleteOption[]>(() => {
        const terminals = terminalsData()?.data ?? [];
        return terminals.map(terminal => ({
            value: terminal.tid || '',
            label: terminal.tid || 'Unknown',
            sublabel: terminal.merchant?.agent_name || terminal.merchant_id || '',
        }));
    });

    const isLoading = createMemo(() => terminalsData() === undefined);

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            label={props.label}
            placeholder={props.placeholder || "Search by TID or Merchant..."}
            required={props.required}
            disabled={props.disabled}
            loading={isLoading()}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default TerminalAutocomplete;
