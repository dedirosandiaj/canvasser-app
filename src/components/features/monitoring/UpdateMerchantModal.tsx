import { createSignal, Show } from 'solid-js';
import { Modal, TextField, Button } from '~/components/ui';
import { updateMerchant } from '~/lib/server/actions.server';
import type { Merchant } from '~/types';

interface UpdateMerchantModalProps {
    open: boolean;
    onClose: () => void;
    merchant: Merchant;
    onSuccess?: () => void;
}

export default function UpdateMerchantModal(props: UpdateMerchantModalProps) {
    // Initialize state with props
    const [agentName, setAgentName] = createSignal(props.merchant.agent_name || props.merchant.name || '');
    const [corporateName, setCorporateName] = createSignal(props.merchant.corporate_name || '');
    const [ownerName, setOwnerName] = createSignal(props.merchant.owner_name || '');
    const [ownerPhone, setOwnerPhone] = createSignal(props.merchant.owner_phone || '');
    const [address, setAddress] = createSignal(props.merchant.address || '');
    const [operationalHours, setOperationalHours] = createSignal(props.merchant.operational_hours || '');
    const [businessSector, setBusinessSector] = createSignal(props.merchant.business_sector || '');

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal('');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const result = await updateMerchant(props.merchant.id, {
            agentName: agentName(),
            corporateName: corporateName(),
            ownerName: ownerName(),
            ownerPhone: ownerPhone(),
            address: address(),
            operationalHours: operationalHours(),
            businessSector: businessSector(),
        });

        setIsSubmitting(false);

        if (result.success) {
            props.onSuccess?.();
            props.onClose();
        } else {
            setError(result.error || 'Failed to update merchant');
        }
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Edit Merchant"
            size="md"
            footer={
                <>
                    <Button variant="text" color="gray" onClick={props.onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting()}
                    >
                        {isSubmitting() ? 'Saving...' : 'Save Changes'}
                    </Button>
                </>
            }
        >
            <div class="space-y-4">
                <Show when={error()}>
                    <div class="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error()}
                    </div>
                </Show>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Agent Name"
                        value={agentName()}
                        onInput={(e) => setAgentName(e.currentTarget.value)}
                        required
                    />
                    <TextField
                        label="Corporate Name"
                        value={corporateName()}
                        onInput={(e) => setCorporateName(e.currentTarget.value)}
                    />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Owner Name"
                        value={ownerName()}
                        onInput={(e) => setOwnerName(e.currentTarget.value)}
                    />
                    <TextField
                        label="Owner Phone"
                        value={ownerPhone()}
                        onInput={(e) => setOwnerPhone(e.currentTarget.value)}
                    />
                </div>

                <TextField
                    label="Address"
                    value={address()}
                    onInput={(e) => setAddress(e.currentTarget.value)}
                    fullWidth
                    required
                />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Business Sector"
                        value={businessSector()}
                        onInput={(e) => setBusinessSector(e.currentTarget.value)}
                    />
                    <TextField
                        label="Operational Hours"
                        value={operationalHours()}
                        onInput={(e) => setOperationalHours(e.currentTarget.value)}
                    />
                </div>
            </div>
        </Modal>
    );
}
