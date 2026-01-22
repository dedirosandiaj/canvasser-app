/**
 * City Autocomplete Component
 * Specialized autocomplete for selecting city codes (Dati 2)
 */

import { createResource, createMemo } from 'solid-js';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { getCities } from '~/lib/server/data.server';

export interface CityAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    provinceCode?: string; // Optional filter by province
    label?: string;
    required?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    class?: string;
}

export function CityAutocomplete(props: CityAutocompleteProps) {
    // Fetch cities once and cache
    const [cities] = createResource(() => getCities());

    // Convert to autocomplete options, optionally filtered by province
    const options = createMemo<AutocompleteOption[]>(() => {
        let data = cities()?.data ?? [];

        // Filter by province if provided
        if (props.provinceCode) {
            data = data.filter(c => c.province_code === props.provinceCode);
        }

        return data.map(city => ({
            value: city.code,
            label: `${city.code} - ${city.name}`,
            sublabel: city.province?.name || '',
        }));
    });

    return (
        <Autocomplete
            options={options()}
            value={props.value}
            onChange={props.onChange}
            placeholder="Type to search city..."
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            loading={cities.loading}
            fullWidth={props.fullWidth}
            helperText={props.helperText}
            class={props.class}
        />
    );
}

export default CityAutocomplete;
