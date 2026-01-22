import { createSignal, Show, onMount } from 'solid-js';
import { submitVisit, type VisitData } from '~/lib/server/sheets';
import { uploadToGoogleDrive } from '~/lib/server/gdrive';
import { TextField, Button, Card, Alert, PhotoCapture, SalesAutocomplete } from '~/components/ui';

export default function CanvasserForm() {

    const [manualMode, setManualMode] = createSignal(false);

    // Form state
    const [formData, setFormData] = createSignal({
        nama_sales: '',
        nama_toko: '',
        nama_pic: '',
        no_telp: '',
        kota: '',
        kecamatan: '',
        status: '',
        keterangan: '',
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
                const kota = address.city || address.municipality || address.town || address.county || address.regency || '';
                const kecamatan = address.suburb || address.subdistrict || address.village || address.neighbourhood || '';

                if (kota || kecamatan) {
                    setFormData(prev => ({ ...prev, kota, kecamatan }));
                    setDebugStatus(prev => prev + '\n✅ 2. Alamat: ' + (kota || 'Kota?') + ', ' + (kecamatan || 'Kec?'));
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
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
            );

            if (response.ok) {
                const data = await response.json();
                const kota = data.city || data.locality || '';
                const kecamatan = ''; 

                setFormData(prev => ({ 
                    ...prev, 
                    kota: kota || prev.kota, 
                    kecamatan: kecamatan || prev.kecamatan 
                }));
                setDebugStatus(prev => prev + `\n✅ 2. Alamat (Backup): ${kota}`);
                return;
            }
        } catch (e: any) {
            console.error('BigDataCloud Failed:', e);
            setDebugStatus(prev => prev + `\n❌ Gagal ambil alamat. Isi manual.`);
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
                
                // Update State
                setCoords({ lat, lng });
                setFormData(prev => ({ 
                    ...prev, 
                    kota: kota || prev.kota 
                }));
                
                setDebugStatus(prev => prev + `\n✅ Lokasi Ditemukan (Estimasi IP): ${kota}\nLat: ${lat}, Lng: ${lng}`);
                alert(`GPS Browser Gagal/Diblokir.\n\nMenggunakan Lokasi Estimasi IP:\n${kota}\n(${lat}, ${lng})`);
            } else {
                throw new Error('IP Service unavailable');
            }
        } catch (e: any) {
            console.error('IP Geo Failed:', e);
            setDebugStatus(prev => prev + `\n❌ Semua metode gagal. Mohon isi manual.`);
            alert("Gagal mendapatkan lokasi otomatis. Silakan gunakan 'Mode Manual' dan isi form secara manual.");
        } finally {
            setLocationLoading(false);
        }
    };

    const simulateLocation = () => {
        setDebugStatus('Using Simulated Location (Jakarta)...');
        // Monas, Jakarta coordinates
        const lat = -6.175392;
        const lng = 106.827153;
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
    };

    // Simplified Geolocation (Standard Browser)
    const getLocation = () => {
        console.log('Using standard browser geolocation...');
        setError(''); 
        setDebugStatus('Requesting browser location (Standard)...');
        setLocationLoading(true);

        // Check if blocked by security
        if (!navigator.geolocation) {
            console.warn('Geolocation API not found/blocked. Trying IP Fallback.');
            getIpLocation();
            return;
        }

        // Simple standard call
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Step 1: Coords Acquired
                const coordMsg = `✅ 1. Koordinat OK (GPS): ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                setDebugStatus(coordMsg + '\n⏳ 2. Mengambil Data Alamat...');
                
                setCoords({ lat, lng });
                
                // Step 2: Fetch Address (Separated)
                console.log('Coords found. Triggering Reverse Geocode...');
                reverseGeocode(lat, lng);
                setLocationLoading(false);
            },
            (err) => {
                console.warn("Geo Error:", err);
                const msg = `GPS Error: ${err.message}. Switch to IP Fallback...`;
                setDebugStatus(msg);
                
                // Automatically switch to IP Fallback
                getIpLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000, // Timeout reduced to 5s to trigger fallback faster
                maximumAge: 0
            }
        );
    };

    const [geoState, setGeoState] = createSignal({
        ready: false,
        secure: false,
        hasGeo: false,
        protocol: '',
        host: ''
    });

    // Auto-get location on mount
    onMount(() => {
        // Run diagnostics
        setGeoState({
            ready: true,
            secure: window.isSecureContext,
            hasGeo: 'geolocation' in navigator,
            protocol: window.location.protocol,
            host: window.location.hostname
        });

        // We delay slightly to ensure UI is ready, but still trigger it.
        setTimeout(() => {
            console.log("Auto-triggering location...");
            getLocation();
        }, 1000);
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

        // Validation
        if (!formData().nama_sales || !formData().nama_toko || !formData().nama_pic || !formData().status || !photoFile()) {
            setError('Please fill all required fields and ensure location is active.');
            return;
        }

        // Location Check: Required unless Manual Mode is ON
        if (!coords() && !manualMode()) {
            setError('Location is required. Please enable GPS or check "Mode Manual".');
            return;
        }

        if (formData().status === 'Follow-Up' && !formData().no_telp) {
            setError('Phone number is required for Follow-Up.');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload Photo
            const fileArrayBuffer = await photoFile()!.arrayBuffer();
            const uploadRes = await uploadToGoogleDrive(fileArrayBuffer, `visit_${Date.now()}_${photoFile()!.name}`, photoFile()!.type);

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

            setSuccess(true);
            setFormData({
                nama_sales: '',
                nama_toko: '',
                nama_pic: '',
                no_telp: '',
                kota: '',
                kecamatan: '',
                status: '',
                keterangan: '',
            });
            setPhotoFile(null);
            setPreviewUrl(null);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-gray-50 p-4">
            <div class="max-w-md mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 text-center">Store Visit Form</h1>

                <Show when={error()}>
                    <Alert variant="filled" severity="error">{error()}</Alert>
                </Show>

                <Show when={success()}>
                    <Alert variant="filled" severity="success">Visit recorded successfully!</Alert>
                </Show>

                <form onSubmit={handleSubmit} class="space-y-4">
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
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status Kunjungan *</label>
                                <select
                                    class="w-full rounded-md border border-gray-300 p-2"
                                    value={formData().status}
                                    onChange={(e) => setFormData({ ...formData(), status: e.currentTarget.value })}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Follow-Up">Follow-Up</option>
                                    <option value="Tidak Tertarik">Tidak Tertarik</option>
                                </select>
                            </div>

                            <Show when={formData().status === 'Follow-Up'}>
                                <TextField
                                    label="Nomor Telepon"
                                    type="tel"
                                    value={formData().no_telp}
                                    onInput={(e) => setFormData({ ...formData(), no_telp: e.currentTarget.value.replace(/\D/g, '') })}
                                    required
                                    fullWidth
                                    helperText="Numbers only"
                                />
                            </Show>

                            {/* Location */}
                            <div class="flex gap-2">
                                <TextField
                                    label="Kota"
                                    value={formData().kota}
                                    onInput={(e) => setFormData({ ...formData(), kota: e.currentTarget.value })}
                                    fullWidth
                                    placeholder={locationLoading() ? "Loading..." : "Kota"}
                                />
                                <TextField
                                    label="Kecamatan"
                                    value={formData().kecamatan}
                                    onInput={(e) => setFormData({ ...formData(), kecamatan: e.currentTarget.value })}
                                    fullWidth
                                    placeholder={locationLoading() ? "Loading..." : "Kecamatan"}
                                />
                            </div>


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
                            <div class="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div class="flex items-center justify-between">
                                    <label class="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={manualMode()}
                                            onChange={(e) => setManualMode(e.currentTarget.checked)}
                                            class="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        />
                                        <span class="text-sm font-medium text-gray-700">Mode Manual (Tanpa GPS)</span>
                                    </label>
                                    <span class="text-xs text-gray-400 italic">Gunakan jika GPS Error</span>
                                </div>

                                <Show when={manualMode()}>
                                    <div class="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    <div class="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                        ⚠️ Lokasi akan tercatat manual/kosong. Pastikan alamat terisi benar.
                                    </div>
                                </Show>

                                <Show when={!manualMode()}>
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-center justify-between">
                                            <div class="text-xs text-gray-500 flex items-center gap-1">
                                                <span class={coords() ? "text-green-600 font-bold" : "text-red-500 font-medium"}>
                                                    {coords() ? "✅ Lokasi Terkunci" : "❌ Menunggu Lokasi..."}
                                                </span>
                                            </div>
                                            <div class="flex gap-1">
                                                <Button 
                                                    type="button" 
                                                    variant="outlined" 
                                                    size="sm" 
                                                    onClick={() => { console.log('Refresh clicked'); getLocation(); }}
                                                    disabled={locationLoading()}
                                                >
                                                    {locationLoading() ? "Mencari..." : "Refresh"}
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="text" 
                                                    size="sm" 
                                                    color="warning"
                                                    onClick={() => { console.log('Test clicked'); simulateLocation(); }}
                                                    disabled={locationLoading()}
                                                    class="text-xs px-2"
                                                >
                                                    Test
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Debug info for user */}
                                        <div class="text-[10px] text-gray-500 font-mono bg-gray-100 p-2 rounded border border-gray-200 break-words whitespace-pre-wrap">
                                            LOG: {debugStatus()}
                                        </div>
                                        
                                        {/* Diagnostics Panel (Analysis) */}
                                        <div class="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-800 font-mono">
                                            <strong>🔍 DIAGNOSTICS (Client-Side):</strong><br/>
                                            <Show when={geoState().ready} fallback="Loading check...">
                                                • Secure Context: {geoState().secure ? '✅ YES' : '❌ NO (Geo blocked in HTTP)'}<br/>
                                                • Navigator.geo: {geoState().hasGeo ? '✅ Available' : '❌ Not Found'}<br/>
                                                • Protocol: {geoState().protocol}<br/>
                                                • Host: {geoState().host}<br/>
                                            </Show>
                                            <Show when={!geoState().secure && geoState().ready}>
                                                <span class="text-red-600 font-bold block mt-1">
                                                    ⚠️ PENYEBAB: Browser memblokir Lokasi karena website tidak HTTPS (atau Localhost).
                                                    <br/>Gunakan 'Mode Manual' di atas untuk lanjut.
                                                </span>
                                            </Show>
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
        </div>
    );
}
