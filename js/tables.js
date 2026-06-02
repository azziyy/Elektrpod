/**
 * TABLES - Jadval boshqaruvi
 * ============================================
 */

const Tables = {
    
    currentPage: 'podstansiya',
    currentData: [],
    filteredData: [],
    relatedData: {
        podstansiya: [],
        liniya: []
    },
    editingId: null,
    
    /**
     * Sahifani yuklash
     */
    loadPage: async function(pageKey) {
        this.currentPage = pageKey;
        UI.setActivePage(pageKey);
        await this.loadData();
    },
    
    /**
     * Ma'lumotlarni yuklash
     */
    loadData: async function() {
        const page = CONFIG.PAGES[this.currentPage];
        if (!page) return;
        
        UI.showLoading(true);
        try {
            // Asosiy ma'lumotlar
            const response = await API.getAll(page.sheet);
            this.currentData = response.data || [];
            this.filteredData = [...this.currentData];
            
            // Bog'liq ma'lumotlarni ham yuklash (select uchun)
            if (this.currentPage === 'liniya' && this.relatedData.podstansiya.length === 0) {
                const podResp = await API.getAll(CONFIG.PAGES.podstansiya.sheet);
                this.relatedData.podstansiya = podResp.data || [];
            }
            if (this.currentPage === 'hisoblagich') {
                if (this.relatedData.liniya.length === 0) {
                    const linResp = await API.getAll(CONFIG.PAGES.liniya.sheet);
                    this.relatedData.liniya = linResp.data || [];
                }
            }
            
            this.renderTable();
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
            console.error(error);
        } finally {
            UI.showLoading(false);
        }
    },
    
    /**
     * Jadvalni render qilish
     */
    renderTable: function() {
        const page = CONFIG.PAGES[this.currentPage];
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        const noData = document.getElementById('noData');
        
        // Header
        let headerHtml = '<tr>';
        page.columns.forEach(col => {
            headerHtml += `<th>${col.label}</th>`;
        });
        headerHtml += '<th>Tahrirlangan vaqti</th>';
        headerHtml += '<th style="text-align:right">Amallar</th>';
        headerHtml += '</tr>';
        tableHead.innerHTML = headerHtml;
        
        // Body
        if (!this.filteredData || this.filteredData.length === 0) {
            tableBody.innerHTML = '';
            noData.classList.remove('hidden');
        } else {
            noData.classList.add('hidden');
            let bodyHtml = '';
            
            this.filteredData.forEach((row, index) => {
                bodyHtml += '<tr>';
                page.columns.forEach(col => {
                    let value = row[col.key] || '';
                    
                    // Sana formatlash
                    if (col.type === 'date' && value) {
                        value = CONFIG.formatDate(value);
                    }
                    
                    bodyHtml += `<td>${this.escapeHtml(value)}</td>`;
                });
                
                // Tahrirlangan vaqti
                const updatedAt = row.updated_at || row.created_at || '';
                bodyHtml += `<td class="timestamp-cell">${CONFIG.formatDateTime(updatedAt)}</td>`;
                
                // Amallar
                bodyHtml += `
                    <td class="action-cell">
                        <button class="action-btn edit" onclick="Tables.editRow(${row.id})" title="Tahrirlash">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="action-btn delete" onclick="Tables.deleteRow(${row.id})" title="O'chirish">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>`;
                bodyHtml += '</tr>';
            });
            
            tableBody.innerHTML = bodyHtml;
        }
        
        // Statistika
        document.getElementById('totalRecords').textContent = this.filteredData.length;
        const filterInfo = document.getElementById('filteredInfo');
        if (this.currentData.length !== this.filteredData.length) {
            filterInfo.textContent = `(${this.currentData.length} dan filtrlangan)`;
        } else {
            filterInfo.textContent = '';
        }
    },
    
    /**
     * HTML escape
     */
    escapeHtml: function(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },
    
    /**
     * Yangi yozuv qo'shish modal
     */
    openAddModal: function() {
        this.editingId = null;
        document.getElementById('modalTitle').textContent = "Yangi yozuv qo'shish";
        this.renderForm();
        UI.openModal('dataModal');
    },
    
    /**
     * Tahrirlash modal
     */
    editRow: function(id) {
        this.editingId = id;
        const row = this.currentData.find(r => String(r.id) === String(id));
        if (!row) return;
        
        document.getElementById('modalTitle').textContent = `Yozuvni tahrirlash (ID: ${id})`;
        this.renderForm(row);
        UI.openModal('dataModal');
    },
    
    /**
     * Form yaratish
     */
    renderForm: function(data = {}) {
        const page = CONFIG.PAGES[this.currentPage];
        const formFields = document.getElementById('formFields');
        let html = '';
        
        page.columns.forEach(col => {
            // Auto-generated fieldlarni faqat ko'rsatish (yangi qo'shish vaqtida emas)
            if (col.auto && !this.editingId) return;
            
            const value = data[col.key] !== undefined ? data[col.key] : '';
            const required = col.required ? 'required' : '';
            const readonly = col.readonly ? 'readonly' : '';
            
            html += `<div class="form-field">`;
            html += `<label>${col.label}${col.required ? ' *' : ''}</label>`;
            
            if (col.type === 'select') {
                let options = '<option value="">-- Tanlang --</option>';
                
                if (col.source) {
                    // Bog'liq jadvaldan options
                    const sourceData = this.relatedData[col.source] || [];
                    sourceData.forEach(item => {
                        const label = item.nomi || item.unique_nomi || item.id;
                        const selected = String(value) === String(item.id) ? 'selected' : '';
                        options += `<option value="${item.id}" ${selected}>${item.id} - ${this.escapeHtml(label)}</option>`;
                    });
                } else if (col.options) {
                    col.options.forEach(opt => {
                        const selected = value === opt ? 'selected' : '';
                        options += `<option value="${opt}" ${selected}>${opt}</option>`;
                    });
                }
                
                html += `<select name="${col.key}" ${required} ${readonly}>${options}</select>`;
            } else if (col.type === 'date') {
                // Sanani YYYY-MM-DD formatga o'tkazish
                let dateValue = value;
                if (dateValue && dateValue.includes('.')) {
                    const [d, m, y] = dateValue.split('.');
                    dateValue = `${y}-${m}-${d}`;
                } else if (dateValue) {
                    const dt = new Date(dateValue);
                    if (!isNaN(dt.getTime())) {
                        dateValue = dt.toISOString().split('T')[0];
                    }
                }
                html += `<input type="date" name="${col.key}" value="${dateValue}" ${required} ${readonly}>`;
            } else if (col.type === 'number') {
                const placeholder = col.placeholder || '';
                html += `<input type="number" name="${col.key}" value="${value}" placeholder="${placeholder}" ${required} ${readonly} step="any">`;
            } else {
                const placeholder = col.placeholder || '';
                html += `<input type="text" name="${col.key}" value="${this.escapeHtml(value)}" placeholder="${placeholder}" ${required} ${readonly}>`;
            }
            
            html += `</div>`;
        });
        
        formFields.innerHTML = html;
    },
    
    /**
     * Formni saqlash
     */
    saveForm: async function() {
        const page = CONFIG.PAGES[this.currentPage];
        const form = document.getElementById('dataForm');
        const formData = new FormData(form);
        
        const data = {};
        let hasError = false;
        
        page.columns.forEach(col => {
            if (col.auto && !this.editingId) return;
            
            let value = formData.get(col.key);
            
            if (col.required && (!value || value.toString().trim() === '')) {
                UI.showSnackbar(`"${col.label}" maydonini to'ldiring`, 'error');
                hasError = true;
                return;
            }
            
            data[col.key] = value;
        });
        
        if (hasError) return;
        
        // liniya_nomi avtomatik to'ldirish (hisoblagich uchun)
        if (this.currentPage === 'hisoblagich' && data.p_id) {
            const liniya = this.relatedData.liniya.find(l => String(l.id) === String(data.p_id));
            if (liniya) {
                data.liniya_nomi = liniya.nomi || liniya.unique_nomi || data.liniya_nomi;
            }
        }
        
        UI.showLoading(true);
        try {
            const author = Auth.getCurrentUser();
            
            if (this.editingId) {
                await API.update(page.sheet, this.editingId, data, author);
                UI.showSnackbar("Yozuv muvaffaqiyatli yangilandi", 'success');
            } else {
                await API.create(page.sheet, data, author);
                UI.showSnackbar("Yangi yozuv qo'shildi", 'success');
            }
            
            UI.closeModal('dataModal');
            await this.loadData();
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
        } finally {
            UI.showLoading(false);
        }
    },
    
    /**
     * Yozuvni o'chirish
     */
    deleteRow: function(id) {
        UI.confirm(`Yozuv (ID: ${id}) ni o'chirmoqchimisiz?`, async () => {
            const page = CONFIG.PAGES[this.currentPage];
            UI.showLoading(true);
            try {
                await API.delete(page.sheet, id);
                UI.showSnackbar("Yozuv o'chirildi", 'success');
                await this.loadData();
            } catch (error) {
                UI.showSnackbar('Xatolik: ' + error.message, 'error');
            } finally {
                UI.showLoading(false);
            }
        });
    },
    
    /**
     * Qidirish
     */
    search: function(query) {
        query = query.toLowerCase().trim();
        if (!query) {
            this.filteredData = [...this.currentData];
        } else {
            this.filteredData = this.currentData.filter(row => {
                return Object.values(row).some(val => 
                    String(val || '').toLowerCase().includes(query)
                );
            });
        }
        this.renderTable();
    },
    
    /**
     * Filter (faqat hisoblagich uchun)
     */
    applyFilter: function() {
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        const time = document.getElementById('filterTime').value;
        
        this.filteredData = this.currentData.filter(row => {
            // Sana filter
            if (dateFrom || dateTo) {
                const rowDate = CONFIG.parseDate(row.sana);
                if (!rowDate) return false;
                
                if (dateFrom) {
                    const from = new Date(dateFrom);
                    if (rowDate < from) return false;
                }
                if (dateTo) {
                    const to = new Date(dateTo);
                    to.setHours(23, 59, 59);
                    if (rowDate > to) return false;
                }
            }
            
            // Vaqt filter
            if (time && row.vaqt !== time) return false;
            
            return true;
        });
        
        this.renderTable();
        UI.showSnackbar(`Topildi: ${this.filteredData.length} ta yozuv`, 'info');
    },
    
    /**
     * Filterni tozalash
     */
    clearFilter: function() {
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterTime').value = '';
        document.getElementById('searchInput').value = '';
        this.filteredData = [...this.currentData];
        this.renderTable();
    }
};
