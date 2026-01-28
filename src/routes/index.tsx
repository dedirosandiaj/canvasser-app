import { createSignal, Show, onMount, createEffect, onCleanup } from 'solid-js';
import imageCompression from 'browser-image-compression';
import { submitVisit, getStatusList, type VisitData, type StatusOption } from '~/lib/server/sheets';
import { uploadToGoogleDrive } from '~/lib/server/gdrive';
import { TextField, Button, Card, Alert, PhotoCapture, SalesAutocomplete, Select, Autocomplete } from '~/components/ui';
import Swal from 'sweetalert2';

export default function CanvasserForm() {

    // Small SweetAlert Configuration
    // Small SweetAlert Configuration
    const smallSwal = Swal.mixin({
        width: '320px',
        customClass: {
            popup: 'text-sm rounded-none',
            title: 'text-lg font-bold text-gray-900',
            confirmButton: 'text-sm px-6 py-2.5 rounded-none font-medium shadow-sm',
            htmlContainer: 'text-gray-600'
        },
        buttonsStyling: true,
        confirmButtonColor: '#e11d48', // Primary Brand Color
        background: '#ffffff',
        showCloseButton: false
    });

    // --- Access Code Logic ---
    const [isAuthenticated, setIsAuthenticated] = createSignal(false);

    const checkAccess = () => {
        const isVerified = localStorage.getItem('isVerified');
        if (isVerified === 'true') {
            setIsAuthenticated(true);
            return;
        }

        Swal.fire({
            title: 'Kode Akses',
            input: 'password',
            inputPlaceholder: 'Masukkan kode...',
            width: '300px',
            customClass: {
                popup: 'rounded-none shadow-lg',
                title: 'text-lg font-bold text-gray-800',
                input: 'text-sm border-gray-300 rounded-none focus:ring-primary focus:border-primary px-3 py-2',
                confirmButton: 'text-sm px-6 py-2 rounded-none font-medium bg-rose-600 text-white hover:bg-rose-700 w-full mt-2',
                validationMessage: 'text-xs text-rose-600 mt-2'
            },
            buttonsStyling: false,
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'Masuk',
            showLoaderOnConfirm: true,
            preConfirm: (login) => {
                if (login !== 'Nus4c1t4#') { 
                    Swal.showValidationMessage('Kode akses salah!');
                }
                return login === 'Nus4c1t4#';
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('isVerified', 'true');
                setIsAuthenticated(true);
                Swal.fire({
                    icon: 'success',
                    title: 'Akses Diterima',
                    showConfirmButton: false,
                    timer: 1500,
                    width: '300px',
                    customClass: {
                        popup: 'rounded-none shadow-lg',
                        title: 'text-lg font-bold text-gray-800'
                    }
                });
            }
        });
    };

    const [manualMode, setManualMode] = createSignal(false);

    // Form state
    // Form state - Initialize from localStorage if available
    const [formData, setFormData] = createSignal({
        nama_sales: '',
        nama_toko: '',
        nama_pic: '',
        no_telp: '',
        kota: '',
        kecamatan: '',
        provinsi: '',
        status: '',
        keterangan: '',
    });

    const [statusOptions, setStatusOptions] = createSignal<StatusOption[]>([]);

    onMount(() => {
        checkAccess(); 
        const savedData = localStorage.getItem('canvasser_form_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
                // If there's saved data, minimal restore feedback if needed, 
                // but usually silent restore is better for "Old Input" behavior.
            } catch (e) {
                console.error('Failed to parse saved form data', e);
            }
        }

        // Auto-trigger location slightly delayed
        setTimeout(() => {
            console.log("Auto-triggering location...");
            startWatchingLocation();
        }, 1000);
        // Auto-trigger location slightly delayed
        setTimeout(() => {
            console.log("Auto-triggering location...");
            startWatchingLocation();
        }, 1000);

        // Fetch Status List
        getStatusList().then(options => {
             console.log('Fetched Status Options:', options);
             setStatusOptions(options);
        });
    });

    // Persist form data to localStorage whenever it changes
    createEffect(() => {
        const data = formData();
        localStorage.setItem('canvasser_form_data', JSON.stringify(data));
    });

    const [photoFile, setPhotoFile] = createSignal<File | null>(null);
    const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
    const [coords, setCoords] = createSignal<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = createSignal(false);

    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal('');
    const [success, setSuccess] = createSignal(false);

    const [debugStatus, setDebugStatus] = createSignal<string>('Ready to start');


    // Reverse geocoding using Free Providers (OSM & BigDataCloud)
    const reverseGeocode = async (lat: number, lng: number) => {
        setDebugStatus(`Got Coords (${lat.toFixed(5)}, ${lng.toFixed(5)}). Fetching address...`);

        // 1. Try Nominatim (OpenStreetMap)
        try {
            setLocationLoading(true);
            setDebugStatus(`Trying Provider 1: OpenStreetMap...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3s

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    signal: controller.signal,
                    headers: {
                        'Accept-Language': 'id',
                        'User-Agent': 'CanvasserApp/1.0'
                    }
                }
            );
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const address = data.address || {};
                // User Feedback: county -> Kota, municipality -> Kecamatan
                // Ref: https://wiki.openstreetmap.org/wiki/Id:Indonesian_Tagging_Guidelines/Admin_Level
                
                // Helper to normalize strings for comparison
                const normalize = (s: string) => s ? s.trim().toLowerCase() : '';

                // 3. Determine Provinsi - User Preference: State
                const provinsi = address.state || address.region || '';
                const provinsiNorm = normalize(provinsi);

                // 1. Determine Kota (City/Kabupaten) - User Preference: County
                // Fallback priorities: county > city > regency > town
                let kota = '';
                const kotaCandidates = [address.county, address.city, address.regency, address.town];
                
                for (const candidate of kotaCandidates) {
                    if (candidate && normalize(candidate) !== provinsiNorm) {
                        kota = candidate;
                        break;
                    }
                }
                // Fallback: If all candidates match province (rare but possible), just take the first valid one.
                if (!kota && kotaCandidates.some(c => c)) {
                     kota = kotaCandidates.find(c => c) || '';
                }

                // 2. Determine Kecamatan (District) - User Preference: Municipality
                // Priority: municipality > district > suburb > subdistrict > ...
                // Deduplication: MUST NOT be same as Kota OR Provinsi
                const kotaNorm = normalize(kota);
                let kecamatan = '';
                const kecCandidates = [
                    address.municipality, // User requested priority
                    address.district,
                    address.suburb,
                    address.subdistrict, 
                    address.village,
                    address.neighbourhood
                ];

                for (const candidate of kecCandidates) {
                    const candNorm = normalize(candidate);
                    if (candidate && candNorm !== kotaNorm && candNorm !== provinsiNorm) {
                        kecamatan = candidate;
                        break;
                    }
                }

                if (kota || kecamatan || provinsi) {
                    setFormData(prev => ({ 
                        ...prev, 
                        kota: kota || prev.kota, 
                        kecamatan: kecamatan || prev.kecamatan, 
                        provinsi: provinsi || prev.provinsi
                    }));
                    setDebugStatus(prev => prev + '\n✅ 2. Alamat: ' + (kota || 'Kota?') + ', ' + (kecamatan || 'Kec?') + ', ' + (provinsi || 'Prov?'));
                    return; // Success
                }
            }
        } catch (e: any) {
            console.warn('OSM Failed:', e);
            setDebugStatus(prev => prev + '\n⚠️ OSM Gagal, mencoba server lain...');
        }

        // 2. Fallback: BigDataCloud
        try {
            // setDebugStatus(`Trying Provider 2: BigDataCloud...`); // Too spammy, keep it clean
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );

            if (response.ok) {
                const data = await response.json();
                const kota = data.city || data.locality || '';
                const kecamatan = ''; 
                const provinsi = data.principalSubdivision || '';

                setFormData(prev => ({ 
                    ...prev, 
                    kota: kota || prev.kota, 
                    kecamatan: kecamatan || prev.kecamatan,
                    provinsi: provinsi || prev.provinsi
                }));
                setDebugStatus(prev => prev + `\n✅ 2. Alamat (Backup): ${kota}`);
                return;
            }
        } catch (e: any) {
            console.error('BigDataCloud Failed:', e);
            setDebugStatus(prev => prev + `\n❌ Sistem Gagall ambil alamat. Silahkan Isi manual.`);
        } finally {
            setLocationLoading(false);
        }
    };

    // IP-Based Geolocation (Last Resort)
    const getIpLocation = async () => {
        // ... (existing logic)
        setDebugStatus(prev => prev + '\n⚠️ GPS Gagal. Mencoba estimasi via IP (Jaringan)...');

        try {
            // BigDataCloud with NO lat/lng params returns IP location
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=id`
            );

            if (response.ok) {
                const data = await response.json();
                const lat = data.latitude;
                const lng = data.longitude;
                const kota = data.city || data.locality || '';
                const provinsi = data.principalSubdivision || '';
                
                // Update State
                setCoords({ lat, lng });
                setFormData(prev => ({ 
                    ...prev, 
                    kota: kota || prev.kota,
                    provinsi: provinsi || prev.provinsi
                }));

                setDebugStatus(prev => prev + `\n✅ Lokasi Ditemukan (Estimasi IP): ${kota}\nLat: ${lat}, Lng: ${lng}`);
                alert(`GPS Browser Gagal/Diblokir.\n\nMenggunakan Lokasi Estimasi IP:\n${kota}\n(${lat}, ${lng})`);
            } else {
                throw new Error('IP Service unavailable');
            }
        } catch (e: any) {
            console.error('IP Geo Failed:', e);
            setDebugStatus(prev => prev + `\n❌ Semua metode gagal. Mohon isi manual.`);
            smallSwal.fire({
                icon: 'error',
                title: 'Lokasi Gagal',
                text: "Gagal mendapatkan lokasi otomatis. Silakan gunakan 'Mode Manual' dan isi form secara manual.",
                confirmButtonText: 'OK'
            });
        } finally {
            setLocationLoading(false);
        }
    };

    // --- Realtime GPS Logic ---
    let watchId: number | null = null;
    let lastGeocodedCoords: { lat: number; lng: number } | null = null;
    
    // Haversine Formula to calculate distance in meters
    const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000; // Distance in meters
    };

    const startWatchingLocation = () => {
        console.log('Starting Realtime GPS Tracking...');
        setError('');
        setDebugStatus('Menunggu sinyal GPS Realtime...');
        setLocationLoading(true);

        if (!navigator.geolocation) {
             console.warn('Geolocation API not found/blocked. Trying IP Fallback.');
             getIpLocation();
             return;
        }

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // const accuracy = position.coords.accuracy;

                // 1. Always update coordinates immediately
                setCoords({ lat, lng });
                
                // 2. Check if we need to update address (Throttle: > 30 meters)
                let shouldGeocode = false;
                if (!lastGeocodedCoords) {
                    shouldGeocode = true;
                } else {
                    const dist = getDistanceFromLatLonInMeters(
                        lastGeocodedCoords.lat, 
                        lastGeocodedCoords.lng, 
                        lat, 
                        lng
                    );
                    if (dist > 30) {
                        shouldGeocode = true;
                        // console.log(`Moved ${dist.toFixed(0)}m. Updating address...`);
                    }
                }

                if (shouldGeocode) {
                    setDebugStatus(`✅ GPS Realtime Active\nLat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}\n(Memperbarui Alamat...)`);
                    lastGeocodedCoords = { lat, lng };
                    reverseGeocode(lat, lng); 
                    setLocationLoading(false); 
                } else {
                    // Just update status without fetching address
                     setDebugStatus(`✅ GPS Realtime Active\nLat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
                }
            },
            (err) => {
                console.warn("Watch Position Error:", err);
                if (!coords()) { // Only fallback if we haven't got ANY coords yet
                    const msg = `GPS Error: ${err.message}. Switch to IP Fallback...`;
                    setDebugStatus(msg);
                    getIpLocation();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, 
                maximumAge: 0
            }
        );
    };

    // Auto-get location on mount logic
    // onMount(() => {
    //     // We delay slightly to ensure UI is ready, but still trigger it.
    //     setTimeout(() => {
    //         console.log("Auto-triggering location...");
    //         startWatchingLocation();
    //     }, 1000);
    // });
    // Auto-get location on mount
    onMount(() => {
        setTimeout(() => {
             startWatchingLocation(); // Start
        }, 500);

        onCleanup(() => {
            if (watchId !== null) {
                console.log("Stopping GPS Watcher...");
                navigator.geolocation.clearWatch(watchId);
            }
        });
    });

    const handlePhotoChange = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };


    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation: Collect all missing fields
        const missingFields: string[] = [];
        const data = formData();

        if (!data.nama_sales) missingFields.push('Nama Sales');
        if (!data.nama_toko) missingFields.push('Nama Toko');
        if (!data.nama_pic) missingFields.push('Nama PIC');
        if (!data.status) missingFields.push('Status Kunjungan');
        
        if (!data.no_telp) missingFields.push('Nomor Telepon');

        if (!photoFile()) missingFields.push('Foto Toko');

        // Show comprehensive alert if there are missing fields
        if (missingFields.length > 0) {
             const listHtml = `<ul style="text-align: left; margin-left: 20px;">${missingFields.map(field => `<li>• ${field}</li>`).join('')}</ul>`;
             
             smallSwal.fire({
                icon: 'error',
                title: 'Data Belum Lengkap',
                html: `<p>Mohon lengkapi data berikut:</p><br/>${listHtml}`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            return;
        }

        // Location Check: Required unless Manual Mode is ON
        if (!coords() && !manualMode()) {
            smallSwal.fire({
                 icon: 'error',
                 title: 'Lokasi Kosong',
                 text: 'Lokasi wajib diisi. Mohon aktifkan GPS atau gunakan "Mode Manual".',
                 showConfirmButton: false,
                 timer: 3000,
                 timerProgressBar: true
             });
            return;
        }



        setLoading(true);

        try {
            // 1. Compress & Upload Photo
            let fileToUpload = photoFile()!;

            console.log('Original file size:', fileToUpload.size / 1024 / 1024, 'MB');

            const options = {
                maxSizeMB: 0.8, // Max 800KB
                maxWidthOrHeight: 1280,
                useWebWorker: true
            };

            try {
                fileToUpload = await imageCompression(fileToUpload, options);
                console.log('Compressed file size:', fileToUpload.size / 1024 / 1024, 'MB');
            } catch (cErr) {
                console.error('Compression failed, using original:', cErr);
            }

            const fileArrayBuffer = await fileToUpload.arrayBuffer();
            const uploadRes = await uploadToGoogleDrive(fileArrayBuffer, `visit_${Date.now()}_${fileToUpload.name}`, fileToUpload.type);

            if (!uploadRes.success || !uploadRes.link) {
                throw new Error(uploadRes.error || 'Failed to upload photo');
            }

            // 2. Submit Data
            const finalCoords = coords() || { lat: 0, lng: 0 };

            const visitData: VisitData = {
                ...formData(),
                status: formData().status as any,
                link_foto: uploadRes.link,
                lat: finalCoords.lat.toString(),
                lng: finalCoords.lng.toString(),
            };

            const sheetRes = await submitVisit(visitData);
            if (!sheetRes.success) {
                throw new Error(sheetRes.error || 'Failed to save data');
            }

            // Success!!
            await smallSwal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data kunjungan berhasil disimpan.',
                showConfirmButton: false,
                timer: 1500
            });

            // Clear storage and reload
            localStorage.removeItem('canvasser_form_data');
            window.location.reload();

        } catch (err: any) {
            smallSwal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: err.message || 'Gagal menyimpan data. Silakan coba lagi.',
                confirmButtonText: 'OK'
            });
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-gray-50 p-4">
          <Show when={isAuthenticated()}>
            <div class="max-w-md mx-auto space-y-6">
                <div class="flex justify-center">
                    <img src="/logo-nusacita.png" alt="Logo" class="h-20 w-20 object-contain drop-shadow-md" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900 text-center">Store Visit Form</h1>

                <Show when={error()}>
                    <Alert variant="filled" severity="error">{error()}</Alert>
                </Show>

                <form onSubmit={handleSubmit} class="space-y-4" novalidate>
                    <Card padding="md">
                        <div class="space-y-4">
                            {/* Sales Name */}
                            <SalesAutocomplete
                                value={formData().nama_sales}
                                onChange={(value) => setFormData({ ...formData(), nama_sales: value })}
                                required
                            />

                            {/* Store Info */}
                            <TextField
                                label="Nama Toko"
                                value={formData().nama_toko}
                                onInput={(e) => setFormData({ ...formData(), nama_toko: e.currentTarget.value })}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Nama PIC"
                                value={formData().nama_pic}
                                onInput={(e) => setFormData({ ...formData(), nama_pic: e.currentTarget.value })}
                                required
                                fullWidth
                            />

                            {/* Status & Phone */}
                            <Autocomplete
                                label="Status Kunjungan"
                                placeholder="Pilih..."
                                value={formData().status}
                                onChange={(value) => setFormData({ ...formData(), status: value })}
                                options={statusOptions()}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Nomor Telepon"
                                type="tel"
                                value={formData().no_telp}
                                onInput={(e) => setFormData({ ...formData(), no_telp: e.currentTarget.value.replace(/\D/g, '') })}
                                required
                                fullWidth
                                helperText="Numbers only"
                            />

                            {/* Location */}
                            <div class="flex gap-2">
                                <TextField
                                    label="Kota"
                                    value={formData().kota}
                                    onInput={(e) => setFormData({ ...formData(), kota: e.currentTarget.value })}
                                    fullWidth
                                    placeholder={locationLoading() ? "Loading..." : "Kota"}
                                    readonly={!(
                                        (formData().kota && formData().kecamatan && formData().kota === formData().kecamatan) ||
                                        (formData().kota && formData().provinsi && formData().kota === formData().provinsi)
                                    )}
                                />
                                <TextField
                                    label="Kecamatan"
                                    value={formData().kecamatan}
                                    onInput={(e) => setFormData({ ...formData(), kecamatan: e.currentTarget.value })}
                                    fullWidth
                                    placeholder={locationLoading() ? "Loading..." : "Kecamatan"}
                                    readonly={!(
                                        (formData().kota && formData().kecamatan && formData().kota === formData().kecamatan) ||
                                        (formData().kecamatan && formData().provinsi && formData().kecamatan === formData().provinsi)
                                    )}
                                />
                            </div>
                            
                            <TextField
                                label="Provinsi"
                                value={formData().provinsi}
                                onInput={(e) => setFormData({ ...formData(), provinsi: e.currentTarget.value })}
                                fullWidth
                                placeholder={locationLoading() ? "Loading..." : "Provinsi"}
                                readonly={!(
                                    (formData().provinsi && formData().kota && formData().provinsi === formData().kota) ||
                                    (formData().provinsi && formData().kecamatan && formData().provinsi === formData().kecamatan)
                                )}
                            />


                            {/* Photo */}
                            <PhotoCapture
                                label="Foto Toko"
                                value={photoFile()}
                                onChange={(file) => {
                                    setPhotoFile(file);
                                    setPreviewUrl(file ? URL.createObjectURL(file) : null);
                                }}
                                previewUrl={previewUrl()}
                                required
                                cameraOnly
                                coords={coords()}
                                kota={formData().kota}
                                kecamatan={formData().kecamatan}
                                provinsi={formData().provinsi}
                            />

                            {/* Keterangan */}
                            <div class="flex flex-col gap-1.5 w-full">
                                <label class="text-sm font-medium text-darkText">Keterangan</label>
                                <textarea
                                    value={formData().keterangan}
                                    onInput={(e) => setFormData({ ...formData(), keterangan: e.currentTarget.value })}
                                    rows={3}
                                    class="w-full py-2.5 px-3 bg-surface border border-borderLight rounded-md text-darkText placeholder:text-gray-400 outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                    placeholder="Enter notes..."
                                />
                            </div>

                            {/* Geo Status & Manual Toggle */}
                            {/* Geo Status & Manual Toggle */}
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <label class="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={manualMode()}
                                            onChange={(e) => setManualMode(e.currentTarget.checked)}
                                            class="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        />
                                        <span class="text-sm font-medium text-gray-700">Input Manual</span>
                                    </label>

                                    <Show when={!manualMode()}>
                                        <Button 
                                            type="button" 
                                            variant="text" 
                                            size="sm" 
                                            onClick={() => startWatchingLocation()}
                                            disabled={locationLoading()}
                                            class="text-xs"
                                        >
                                            {locationLoading() ? "" : "Refresh Lokasi"}
                                        </Button>
                                    </Show>
                                </div>

                                <Show when={manualMode()}>
                                    <div class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                                        <TextField
                                            label="Latitude"
                                            value={coords()?.lat.toString() || '0'}
                                            onInput={(e) => setCoords(prev => ({ ...prev!, lat: parseFloat(e.currentTarget.value) || 0 }))}
                                            type="number"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Longitude"
                                            value={coords()?.lng.toString() || '0'}
                                            onInput={(e) => setCoords(prev => ({ ...prev!, lng: parseFloat(e.currentTarget.value) || 0 }))}
                                            type="number"
                                            fullWidth
                                        />
                                    </div>
                                </Show>

                                <Show when={!manualMode()}>
                                    <div class={`p-3 rounded-lg text-sm flex items-center gap-2 transition-colors ${coords() ? "bg-success-50 text-success-700 border border-success-100" :
                                        locationLoading() ? "bg-primary-50 text-primary-700 border border-primary-100" :
                                            "bg-error-50 text-error-700 border border-error-100"
                                        }`}>
                                        <Show when={locationLoading()} fallback={
                                            <Show when={coords()} fallback={
                                                <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            }>
                                                <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </Show>
                                        }>
                                            <svg class="animate-spin w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </Show>

                                        <div class="flex-1 truncate">
                                            {coords() 
                                                ? `${coords()?.lat.toFixed(5)}, ${coords()?.lng.toFixed(5)}`
                                                : locationLoading() 
                                                    ? "" 
                                                    : "Gagal mendeteksi lokasi."
                                            }
                                        </div>
                                    </div>
                                </Show>
                            </div>

                            <Button type="submit" fullWidth loading={loading()} disabled={!coords() && !manualMode()}>
                                Submit Visit
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
          </Show>
        </div>
    );
}
