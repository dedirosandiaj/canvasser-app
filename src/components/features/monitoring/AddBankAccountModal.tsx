import { createSignal, Show, For } from 'solid-js';
import { Modal, TextField, Button } from '~/components/ui';

interface AddBankAccountModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { bankCode: string; accountNumber: string; accountHolderName: string; isPrimary: boolean }) => void;
    isSubmitting?: boolean;
}

export default function AddBankAccountModal(props: AddBankAccountModalProps) {
    const [bankCode, setBankCode] = createSignal('');
    const [accountNumber, setAccountNumber] = createSignal('');
    const [accountHolderName, setAccountHolderName] = createSignal('');
    const [isPrimary, setIsPrimary] = createSignal(false);
    const [error, setError] = createSignal('');

    // Common banks list (hardcoded for now, could be fetched from API)
    const banks = [
        { code: '002', name: 'BRI' },
        { code: '008', name: 'Bank Mandiri' },
        { code: '009', name: 'BNI' },
        { code: '014', name: 'BCA' },
    ];

    const handleSubmit = () => {
        if (!bankCode()) {
            setError('Please select a bank');
            return;
        }
        if (!accountNumber()) {
            setError('Account number is required');
            return;
        }
        if (!accountHolderName()) {
            setError('Account holder name is required');
            return;
        }

        props.onSubmit({
            bankCode: bankCode(),
            accountNumber: accountNumber(),
            accountHolderName: accountHolderName(),
            isPrimary: isPrimary(),
        });

        // Reset form
        setBankCode('');
        setAccountNumber('');
        setAccountHolderName('');
        setIsPrimary(false);
        setError('');
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Add Bank Account"
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
                        disabled={props.isSubmitting}
                    >
                        {props.isSubmitting ? 'Adding...' : 'Add Account'}
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

                <div>
                    <label class="block text-sm font-medium text-gray-900 mb-1.5">
                        Bank Name <span class="text-red-500">*</span>
                    </label>
                    <select
                        value={bankCode()}
                        onChange={(e) => setBankCode(e.currentTarget.value)}
                        class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select Bank</option>
                        <For each={banks}>
                            {(bank) => <option value={bank.code}>{bank.name}</option>}
                        </For>
                    </select>
                </div>

                <TextField
                    label="Account Number"
                    value={accountNumber()}
                    onInput={(e) => setAccountNumber(e.currentTarget.value)}
                    required
                    fullWidth
                    placeholder="e.g. 1234567890"
                />

                <TextField
                    label="Account Holder Name"
                    value={accountHolderName()}
                    onInput={(e) => setAccountHolderName(e.currentTarget.value)}
                    required
                    fullWidth
                    placeholder="e.g. PT. SEJAHTERA"
                />

                <div class="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPrimary"
                        checked={isPrimary()}
                        onChange={(e) => setIsPrimary(e.currentTarget.checked)}
                        class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label for="isPrimary" class="text-sm text-gray-900">
                        Set as primary account
                    </label>
                </div>
            </div>
        </Modal>
    );
}
