/**
 * KONFIGURATSIYA
 * ============================================
 * Google Apps Script web app URL ni shu yerga qo'ying.
 * Apps Script ni deploy qilgandan keyin olingan URL ni shu yerga yozing.
 */

const CONFIG = {
    // ⚠️ MUHIM: Bu URL ni Apps Script ni QAYTADAN deploy qilgandan keyin
    // yangi URL bilan ALMASHTIRING (Deploy > New deployment > Web app)
    // Eski URL ishlamaydi, chunki yangi Code.gs hali deploy qilinmagan.
    API_URL: 'https://script.google.com/macros/s/AKfycbyCBJIFjkQZa3ko3XcndHVyN1iA6TupQIl6uQrEiJ49ENzAHfWXVQwOpXECtKQz4bZy/exec',
    
    // Google Sheet ID (URL dan olinadi)
    SHEET_ID: '1QKPSqZFhVO8ythj8BV5dHPDXs9L3Gbwp2N-X7oT7gs4',
    
    // Sheet nomlari (Google Sheets dagi tab nomlari)
    SHEETS: {
        PODSTANSIYA: 'Podstansiya',
        LINIYA: 'Liniya',
        HISOBLAGICH: 'Hisoblagich',
        USERS: 'Users'  // 4-varaq - foydalanuvchilar
    },
    
    // Sahifa konfiguratsiyalari
    PAGES: {
        podstansiya: {
            title: 'Podstansiyalar',
            sheet: 'Podstansiya',
            columns: [
                { key: 'id', label: 'ID', type: 'number', readonly: true, auto: true },
                { key: 'nomi', label: 'Nomi', type: 'text', required: true },
                { key: 'kuchlanishi', label: 'Kuchlanishi', type: 'text', required: true, placeholder: '500/220/10' }
            ],
            hasFilter: false
        },
        liniya: {
            title: 'Liniyalar',
            sheet: 'Liniya',
            columns: [
                { key: 'id', label: 'ID', type: 'number', readonly: true, auto: true },
                { key: 'p_id', label: 'P_ID (Podstansiya)', type: 'select', required: true, source: 'podstansiya' },
                { key: 'nomi', label: 'Nomi', type: 'text', required: true, placeholder: 'LFS' },
                { key: 'unique_nomi', label: 'Unique Nomi', type: 'text', required: true, placeholder: 'f_lfs' },
                { key: 'kuchlanish', label: 'Kuchlanish (kV)', type: 'number', required: true, placeholder: '220' }
            ],
            hasFilter: false
        },
        hisoblagich: {
            title: "Hisoblagich ko'rsatkichlari",
            sheet: 'Hisoblagich',
            columns: [
                { key: 'id', label: 'ID', type: 'number', readonly: true, auto: true },
                { key: 'p_id', label: 'P_ID', type: 'select', required: true, source: 'liniya' },
                { key: 'liniya_nomi', label: 'Liniya nomi', type: 'text', required: true },
                { key: 'sana', label: 'Sana', type: 'date', required: true },
                { key: 'vaqt', label: 'Vaqt', type: 'select', required: true, options: ['00:00','04:00','08:00','12:00','16:00','20:00'] },
                { key: 'a_plyus', label: 'A+', type: 'number', required: true },
                { key: 'a_minus', label: 'A-', type: 'number', required: true },
                { key: 'r_plyus', label: 'R+', type: 'number', required: true },
                { key: 'r_minus', label: 'R-', type: 'number', required: true },
                { key: 'author', label: 'Muallif', type: 'text', readonly: true, auto: true }
            ],
            hasFilter: true
        }
    },
    
    // Format funksiyalari
    formatDate: function(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    },
    
    formatDateTime: function(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hh}:${mm}`;
    },
    
    parseDate: function(dateStr) {
        if (!dateStr) return null;
        // DD.MM.YYYY -> Date
        if (dateStr.includes('.')) {
            const [d, m, y] = dateStr.split('.');
            return new Date(`${y}-${m}-${d}`);
        }
        return new Date(dateStr);
    }
};
