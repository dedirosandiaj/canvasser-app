import { createSignal, Show } from 'solid-js';
import { Modal, TextField, Button, MerchantAutocomplete, EDCAutocomplete } from '~/components/ui';

interface RegisterTerminalModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { merchantId: string; edcTypeId: number; address: string; city: string }) => void;
    initialMerchantId?: string;
}

export default function RegisterTerminalModal(props: RegisterTerminalModalProps) {
    const [merchantId, setMerchantId] = createSignal(props.initialMerchantId || '');
    const [edcTypeId, setEdcTypeId] = createSignal('');
    const [address, setAddress] = createSignal('');
    const [city, setCity] = createSignal('');
    const [error, setError] = createSignal('');

    const handleSubmit = () => {
        if (!merchantId()) {
            setError('Please select a merchant');
            return;
        }
        if (!edcTypeId()) {
            setError('Please select an EDC type');
            return;
        }
        if (!address()) {
            setError('Please enter installation address');
            return;
        }

        props.onSubmit({
            merchantId: merchantId(),
            edcTypeId: parseInt(edcTypeId()),
            address: address(),
            city: city()
        });

        // Reset form
        setMerchantId('');
        setEdcTypeId('');
        setAddress('');
        setCity('');
        setError('');
        props.onClose();
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Register New Terminal"
            description="Add a new terminal device for an existing merchant."
            size="md"
            footer={
                <>
                    <Button variant="outlined" color="gray" onClick={props.onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Register Terminal</Button>
                </>
            }
        >
            <div class="space-y-4">
                <Show when={error()}>
                    <div class="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                        {error()}
                    </div>
                </Show>

                <Show when={!props.initialMerchantId}>
                    <MerchantAutocomplete
                        label="Select Merchant"
                        value={merchantId()}
                        onChange={(value) => setMerchantId(value)}
                        required
                        fullWidth
                        helperText="Search merchant by name or MID"
                    />
                </Show>

                <EDCAutocomplete
                    label="EDC Type"
                    value={edcTypeId()}
                    onChange={(value) => setEdcTypeId(value)}
                    required
                    fullWidth
                    helperText="Select the device model"
                />

                <TextField
                    label="Installation Address"
                    required
                    placeholder="Street address..."
                    value={address()}
                    onInput={(e) => setAddress(e.currentTarget.value)}
                />

                <TextField
                    label="City"
                    placeholder="e.g. Jakarta"
                    value={city()}
                    onInput={(e) => setCity(e.currentTarget.value)}
                />
            </div>
        </Modal>
    );
}
