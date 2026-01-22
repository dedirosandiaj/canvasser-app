/**
 * Merchant Autocomplete Component
 * Specialized autocomplete for selecting Merchants
 */

import { createResource, createMemo } from 'solid-js';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { getMerchants } from '~/lib/server/data.server';

export interface MerchantAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function MerchantAutocomplete(props: MerchantAutocompleteProps) {
    // Fetch merchants (first 100 for now)
    const [merchants] = createResource(() => getMerchants(1, 100));

    // Convert to autocomplete options - format: [MID] | [Merchant Name]
    const options = createMemo<AutocompleteOption[]>(() => {
        const data = merchants()?.data ?? [];
        return data.map(m => ({
            value: m.mid, // Using MID as value (what user requested)
            label: `${m.mid} | ${m.agent_name || m.corporate_name || m.name || 'Unknown'}`,
            sublabel: m.address || undefined,
        }));
    });

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            placeholder="Search merchant..."
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            loading={merchants.loading}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default MerchantAutocomplete;
