/**
 * AUTH - Foydalanuvchi autentifikatsiyasi
 * ============================================
 */

// ============================================
// VAQTINCHALIK LOGIN (test uchun)
// ============================================
// MUHIM: Dastur to'liq tayyor bo'lgach, BU MASSIVNI BO'SH QILING -> []
// Yoki TEMP_LOGIN_ENABLED = false qiling.
const TEMP_LOGIN_ENABLED = true;
const TEMP_USERS = [
    { username: 'Admin', password: '1234' },
    { username: 'admin', password: '1234' },
    { username: 'test',  password: 'test' }
];

const Auth = {

    currentUser: null,

    /**
     * Login funksiyasi
     * Tartib:
     *   1) Avval vaqtinchalik (hardcoded) foydalanuvchilarni tekshiradi
     *   2) Keyin Google Sheets API (Apps Script) orqali tekshiradi
     *   3) Agar API ishlamasa - faqat vaqtinchalik login orqali kirish mumkin
     */
    login: async function(username, password) {
        const u = (username || '').trim();
        const p = (password || '').trim();

        if (!u || !p) {
            return { success: false, error: "Login va parolni kiriting" };
        }

        // ---------- 1) Vaqtinchalik (offline) login ----------
        if (TEMP_LOGIN_ENABLED) {
            for (let i = 0; i < TEMP_USERS.length; i++) {
                const t = TEMP_USERS[i];
                if (t.username === u && t.password === p) {
                    this.currentUser = t.username;
                    sessionStorage.setItem('elektr_user', t.username);
                    sessionStorage.setItem('elektr_user_source', 'temp');
                    return { success: true, source: 'temp' };
                }
            }
        }

        // ---------- 2) Google Sheets API orqali ----------
        try {
            const response = await API.login(u, p);

            if (response && response.success) {
                this.currentUser = u;
                sessionStorage.setItem('elektr_user', u);
                sessionStorage.setItem('elektr_user_source', response.source || 'sheet');
                return { success: true, source: response.source || 'sheet' };
            }
            return {
                success: false,
                error: (response && response.error) || "Login yoki parol noto'g'ri"
            };
        } catch (error) {
            // API ishlamadi (internet yo'q yoki Apps Script xatosi)
            // Foydalanuvchiga tushunarli xabar
            console.error('Login API error:', error);
            return {
                success: false,
                error: "Server bilan bog'lanib bo'lmadi. Vaqtinchalik login: Admin / 1234"
            };
        }
    },

    /**
     * Logout
     */
    logout: function() {
        this.currentUser = null;
        sessionStorage.removeItem('elektr_user');
        sessionStorage.removeItem('elektr_user_source');
        location.reload();
    },

    /**
     * Sahifa yuklanganda sessionni tekshirish
     */
    checkSession: function() {
        const user = sessionStorage.getItem('elektr_user');
        if (user) {
            this.currentUser = user;
            return true;
        }
        return false;
    },

    /**
     * Joriy foydalanuvchini olish
     */
    getCurrentUser: function() {
        return this.currentUser;
    }
};
