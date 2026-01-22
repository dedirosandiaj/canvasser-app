/**
 * EDC Type Autocomplete Component
 * Specialized autocomplete for selecting EDC types
 */

import { createResource, createMemo } from 'solid-js';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { getEDCTypes } from '~/lib/server/data.server';

export interface EDCAutocompleteProps {
    value?: string; // We use string for compatibility, but it will be parsed to number
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function EDCAutocomplete(props: EDCAutocompleteProps) {
    // Fetch EDC types once and cache
    const [edcTypes] = createResource(() => getEDCTypes());

    // Convert to autocomplete options
    const options = createMemo<AutocompleteOption[]>(() => {
        const data = edcTypes()?.data ?? [];

        return data.map(type => ({
            value: type.id.toString(),
            label: `${type.brand} ${type.model}`,
            sublabel: type.connection_type,
        }));
    });

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            placeholder="Select EDC Type..."
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            loading={edcTypes.loading}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default EDCAutocomplete;
