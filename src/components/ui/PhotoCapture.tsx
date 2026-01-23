/**
 * PhotoCapture Component
 * File input with camera capture option for mobile devices
 */

import { Show, createSignal, onCleanup } from 'solid-js';

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
    
    // Camera State
    const [isCameraOpen, setIsCameraOpen] = createSignal(false);
    const [stream, setStream] = createSignal<MediaStream | null>(null);
    const [cameraError, setCameraError] = createSignal('');
    let videoRef: HTMLVideoElement | undefined;

    const startCamera = async () => {
        try {
            setCameraError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
        } catch (err: any) {
            console.error("Camera Error:", err);
            setCameraError('Gagal membuka kamera: ' + (err.message || 'Permission denied'));
            // Optionally fallback to input file if camera fails? 
            // But user insisted on camera. Let's just show error for now.
             alert("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        }
    };

    const stopCamera = () => {
        const s = stream();
        if (s) {
            s.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (!videoRef || !stream()) return;

        const canvas = document.createElement('canvas');
        if (videoRef.videoWidth === 0 || videoRef.videoHeight === 0) {
            return;
        }

        canvas.width = videoRef.videoWidth;
        canvas.height = videoRef.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    props.onChange(file);
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    onCleanup(() => {
        stopCamera();
    });

    const handleFileChange = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0] || null;
        if (file) {
            props.onChange(file);
        }
    };

    const clearPhoto = () => {
        props.onChange(null);
        if (fileInputRef) fileInputRef.value = '';
    };

    return (
        <div class={`space-y-3 ${props.class || ''}`}>
            <label class="block text-sm font-medium text-gray-700">
                {props.label}
                <Show when={props.required}>
                    <span class="text-red-500 ml-0.5">*</span>
                </Show>
            </label>

            {/* Hidden Input for Gallery (only used if NOT cameraOnly) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                class="hidden"
                onChange={handleFileChange}
            />

            {/* Action Buttons */}
            <div class="flex gap-2">
                <button
                    type="button"
                    onClick={startCamera}
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ambil Foto
                </button>
                
                <Show when={!props.cameraOnly}>
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
                </Show>
            </div>

            {/* Preview (Only shown when not capturing) */}
            <Show when={props.previewUrl}>
                <div class="relative">
                    <img
                        src={props.previewUrl!}
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

            <Show when={props.value}>
                <p class="text-xs text-green-600 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    {props.value!.name}
                </p>
            </Show>

            <Show when={props.helperText}>
                <p class="text-xs text-gray-500">{props.helperText}</p>
            </Show>

            {/* Camera Overlay */}
            <Show when={isCameraOpen() && stream()}>
                <div class="fixed inset-0 z-[100] bg-black flex flex-col justify-between p-4">
                    {/* Header */}
                    <div class="flex justify-end pt-2">
                        <button type="button" onClick={stopCamera} class="bg-gray-800/50 text-white p-2 rounded-full">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Viewport */}
                    <div class="flex-1 flex items-center justify-center overflow-hidden my-4 relative rounded-xl border border-gray-700">
                        <video 
                            ref={(el) => {
                                videoRef = el;
                                el.srcObject = stream()!;
                                el.play();
                            }}
                            class="absolute w-full h-full object-cover"
                            autoplay
                            playsinline
                            muted
                        />
                    </div>

                    {/* Controls */}
                    <div class="flex justify-center pb-8">
                        <button 
                            type="button"
                            onClick={capturePhoto} 
                            class="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:bg-white/20 transition-colors"
                        >
                            <div class="w-16 h-16 bg-white rounded-full"></div>
                        </button>
                    </div>
                </div>
            </Show>
        </div>
    );
}

export default PhotoCapture;
