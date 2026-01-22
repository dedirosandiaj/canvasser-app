/**
 * PhotoCapture Component
 * File input with camera capture option for mobile devices
 */

import { Show, createSignal } from 'solid-js';

interface PhotoCaptureProps {
    label: string;
    value: File | null;
    onChange: (file: File | null) => void;
    previewUrl?: string | null;
    required?: boolean;
    helperText?: string;
    class?: string;
}

export function PhotoCapture(props: PhotoCaptureProps) {
    let fileInputRef: HTMLInputElement | undefined;
    let cameraInputRef: HTMLInputElement | undefined;
    const [localPreview, setLocalPreview] = createSignal<string | null>(null);

    const handleFileChange = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0] || null;
        if (file) {
            props.onChange(file);
            setLocalPreview(URL.createObjectURL(file));
        }
    };

    const previewSrc = () => props.previewUrl || localPreview();

    const clearPhoto = () => {
        props.onChange(null);
        setLocalPreview(null);
        if (fileInputRef) fileInputRef.value = '';
        if (cameraInputRef) cameraInputRef.value = '';
    };

    return (
        <div class={`space-y-3 ${props.class || ''}`}>
            <label class="block text-sm font-medium text-gray-700">
                {props.label}
                <Show when={props.required}>
                    <span class="text-red-500 ml-0.5">*</span>
                </Show>
            </label>

            {/* Hidden inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                class="hidden"
                onChange={handleFileChange}
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                class="hidden"
                onChange={handleFileChange}
            />

            {/* Action buttons */}
            <div class="flex gap-2">
                <button
                    type="button"
                    onClick={() => cameraInputRef?.click()}
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ambil Foto
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef?.click()}
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Pilih dari Galeri
                </button>
            </div>

            {/* Preview */}
            <Show when={previewSrc()}>
                <div class="relative">
                    <img
                        src={previewSrc()!}
                        alt="Preview"
                        class="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={clearPhoto}
                        class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </Show>

            {/* File name indicator */}
            <Show when={props.value}>
                <p class="text-xs text-green-600 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    {props.value!.name}
                </p>
            </Show>

            {/* Helper text */}
            <Show when={props.helperText}>
                <p class="text-xs text-gray-500">{props.helperText}</p>
            </Show>
        </div>
    );
}

export default PhotoCapture;
