'use server';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Types
export interface VisitData {
    nama_sales: string;
    nama_toko: string;
    nama_pic: string;
    no_telp: string;
    kota: string;
    kecamatan: string;
    status: 'Follow-Up' | 'Tidak Tertarik';
    link_foto: string;
    lat: string;
    lng: string;
    keterangan: string;
}

export interface SalesOption {
    value: string;
    label: string;
}

// Helpers
async function getDoc() {
    const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID;

    if (!hasServiceAccount) {
        throw new Error('Server configuration error: Missing Google Sheets credentials');
    }

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

export async function getSalesList(): Promise<SalesOption[]> {
    // Sample data for development/fallback
    const sampleData: SalesOption[] = [
        { value: 'Ahmad Rizki', label: 'Ahmad Rizki' },
        { value: 'Budi Santoso', label: 'Budi Santoso' },
        { value: 'Citra Dewi', label: 'Citra Dewi' },
        { value: 'Dian Pratama', label: 'Dian Pratama' },
        { value: 'Eko Wijaya', label: 'Eko Wijaya' },
        { value: 'Fitri Handayani', label: 'Fitri Handayani' },
        { value: 'Gunawan Putra', label: 'Gunawan Putra' },
        { value: 'Hendra Kusuma', label: 'Hendra Kusuma' },
    ];

    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Data Sales'];

        if (!sheet) {
            console.warn('⚠️ Sheet "Data Sales" not found. Returning sample data.');
            return sampleData;
        }

        try {
            const rows = await sheet.getRows();
            const salesData = rows.map(row => {
                const name = row.get('Nama Sales') || row.get('Nama') || '';
                return { value: name, label: name };
            }).filter(opt => opt.value);

            return salesData.length > 0 ? salesData : sampleData;
        } catch (rowError) {
            console.error('❌ Error fetching rows, using sample data:', rowError);
            return sampleData;
        }

    } catch (error) {
        console.error('❌ Error connecting to Google Sheets:', error);
        return sampleData;
    }
}

export async function submitVisit(data: VisitData): Promise<{ success: boolean; error?: string }> {
    console.log('📝 Submitting visit data to Google Sheets...');

    try {
        const doc = await getDoc();
        const sheetTitle = 'Kunjungan Canvaser';
        let sheet = doc.sheetsByTitle[sheetTitle];

        // Create sheet if not exists
        if (!sheet) {
            console.log(`Title "${sheetTitle}" not found, creating new sheet...`);
            sheet = await doc.addSheet({ title: sheetTitle });
            await sheet.loadCells('A1:K1');
            const headers = ['Timestamp', 'Nama Sales', 'Nama Toko', 'Nama PIC', 'No Telp', 'Kota', 'Kec', 'Status', 'Link Foto', 'Lat/Long', 'Keterangan'];
            await sheet.setHeaderRow(headers);
        }

        const rowValues = [
            new Date().toISOString(),
            data.nama_sales,
            data.nama_toko,
            data.nama_pic,
            data.no_telp,
            data.kota,
            data.kecamatan,
            data.status,
            data.link_foto,
            `${data.lat},${data.lng}`,
            data.keterangan || ''
        ];

        await sheet.addRow(rowValues);
        console.log('✅ Data successfully submitted to Google Sheets');
        return { success: true };

    } catch (error) {
        console.error('❌ Error submitting to sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit data'
        };
    }
}
