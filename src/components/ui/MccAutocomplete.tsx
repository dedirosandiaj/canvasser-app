/**
 * MCC Autocomplete Component
 * Specialized autocomplete for selecting Merchant Category Codes
 */

import { createResource, createMemo } from 'solid-js';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { getMCCs } from '~/lib/server/data.server';

export interface MccAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function MccAutocomplete(props: MccAutocompleteProps) {
    // Fetch MCCs once and cache
    const [mccs] = createResource(() => getMCCs());

    // Convert to autocomplete options
    const options = createMemo<AutocompleteOption[]>(() => {
        const data = mccs()?.data ?? [];
        return data.map(mcc => ({
            value: mcc.code,
            label: `${mcc.code} - ${mcc.category_name}`,
            sublabel: mcc.description,
        }));
    });

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            placeholder="Search MCC code..."
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            loading={mccs.loading}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default MccAutocomplete;
