/**
 * PhotoCapture Component
 * File input with camera capture option for mobile devices
 */

import { Show } from 'solid-js';

interface PhotoCaptureProps {
    label: string;
    value: File | null;
    onChange: (file: File | null) => void;
    previewUrl?: string | null;
    required?: boolean;
    helperText?: string;
    class?: string;
    cameraOnly?: boolean;
}

export function PhotoCapture(props: PhotoCaptureProps) {
    let fileInputRef: HTMLInputElement | undefined;

    return (
        <div class={props.class}>
            <Show when={props.label}>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {props.label} {props.required && <span class="text-red-500">*</span>}
                </label>
            </Show>

            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md relative transition-colors bg-white dark:bg-gray-800 hover:border-blue-500 cursor-pointer"
                 onClick={() => fileInputRef?.click()}
            >
                <div class="space-y-1 text-center w-full">
                    <Show when={props.value || props.previewUrl} fallback={
                        <div class="flex flex-col items-center">
                            <div class="mx-auto h-12 w-12 text-gray-400">
                                <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div class="flex text-sm text-gray-600 dark:text-gray-400 justify-center mt-2">
                                <span class="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                                    Ambil Foto
                                </span>
                            </div>
                        </div>
                    }>
                        <div class="relative flex justify-center">
                           <img 
                                src={props.value ? URL.createObjectURL(props.value) : props.previewUrl!} 
                                class="h-48 object-contain rounded-md" 
                            />
                            <button 
                                type="button"
                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onChange(null);
                                    if (fileInputRef) fileInputRef.value = '';
                                }}
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </Show>
                </div>
            </div>

             <input
                ref={fileInputRef}
                type="file"
                class="hidden"
                accept="image/*"
                // @ts-ignore
                capture="environment"
                onChange={(e) => {
                    if (e.currentTarget.files && e.currentTarget.files[0]) {
                        props.onChange(e.currentTarget.files[0]);
                    }
                }}
            />
            
             <Show when={props.helperText}>
                <p class="mt-2 text-sm text-gray-500">{props.helperText}</p>
            </Show>
        </div>
    );
}

export default PhotoCapture;
