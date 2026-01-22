import { createResource } from 'solid-js';
import { Autocomplete } from '~/components/ui/Autocomplete';
import { getSalesList } from '~/lib/server/sheets';

interface SalesAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
}

export function SalesAutocomplete(props: SalesAutocompleteProps) {
    // Fetch available sales names
    const [salesList] = createResource(getSalesList);

    // Check if we have data - if salesList() returns data, we're not loading
    const isLoading = () => !salesList() && salesList.loading;
    const options = () => salesList() || [];

    return (
        <Autocomplete
            label="Nama Sales"
            placeholder="Pilih atau cari nama sales"
            options={options()}
            value={props.value}
            onChange={props.onChange}
            loading={isLoading()}
            disabled={props.disabled || isLoading()}
            required={props.required}
            helperText={props.helperText}
            fullWidth
            class={props.class}
        />
    );
}

export default SalesAutocomplete;
