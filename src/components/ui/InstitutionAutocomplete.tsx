/**
 * Institution Autocomplete Component
 * Specialized autocomplete for selecting institution codes
 */

import { createResource, createMemo } from 'solid-js';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { getInstitutions } from '~/lib/server/data.server';

export interface InstitutionAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function InstitutionAutocomplete(props: InstitutionAutocompleteProps) {
    // Fetch institutions once and cache
    const [institutions] = createResource(() => getInstitutions());

    // Convert to autocomplete options
    const options = createMemo<AutocompleteOption[]>(() => {
        const data = institutions()?.data ?? [];
        return data.map(inst => ({
            value: inst.code,
            label: `${inst.code} - ${inst.name}`,
            sublabel: inst.description,
        }));
    });

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            placeholder="Type to search institution..."
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            loading={institutions.loading}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default InstitutionAutocomplete;
