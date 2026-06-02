/**
 * API - Google Apps Script bilan aloqa
 * ============================================
 * Barcha so'rovlar Apps Script orqali Google Sheets ga boradi.
 */

const API = {
    
    /**
     * Umumiy so'rov yuborish funksiyasi
     */
    request: async function(action, params = {}) {
        try {
            const url = new URL(CONFIG.API_URL);
            url.searchParams.append('action', action);
            
            // GET so'rovlar uchun params
            Object.keys(params).forEach(key => {
                if (typeof params[key] === 'object') {
                    url.searchParams.append(key, JSON.stringify(params[key]));
                } else {
                    url.searchParams.append(key, params[key]);
                }
            });
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                redirect: 'follow'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || "Noma'lum xatolik");
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    /**
     * POST so'rov (CREATE, UPDATE, DELETE uchun)
     */
    postRequest: async function(action, payload = {}) {
        try {
            const url = new URL(CONFIG.API_URL);
            url.searchParams.append('action', action);
            
            const response = await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify(payload),
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || "Noma'lum xatolik");
            }
            
            return data;
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
    
    /**
     * AUTH - login tekshirish
     */
    login: async function(username, password) {
        return await this.request('login', { username, password });
    },
    
    /**
     * Barcha ma'lumotlarni olish
     */
    getAll: async function(sheet) {
        return await this.request('getAll', { sheet });
    },
    
    /**
     * Yangi yozuv qo'shish
     */
    create: async function(sheet, data, author) {
        return await this.postRequest('create', { sheet, data, author });
    },
    
    /**
     * Yozuvni tahrirlash
     */
    update: async function(sheet, id, data, author) {
        return await this.postRequest('update', { sheet, id, data, author });
    },
    
    /**
     * Yozuvni o'chirish
     */
    delete: async function(sheet, id) {
        return await this.postRequest('delete', { sheet, id });
    }
};
