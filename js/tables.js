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

    // Hisoblagich wizard holati
    hisoblagichWizard: {
        step: 1,
        podstansiyaId: null,
        podstansiyaNomi: '',
        sana: '',
        vaqt: '',
        liniyalar: []
    },
    
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
    openAddModal: async function() {
        this.editingId = null;

        // Hisoblagich sahifasi uchun maxsus wizard (2 bosqichli)
        if (this.currentPage === 'hisoblagich') {
            await this.openHisoblagichWizard();
            return;
        }

        document.getElementById('modalTitle').textContent = "Yangi yozuv qo'shish";
        this.renderForm();
        UI.openModal('dataModal');
    },

    /**
     * HISOBLAGICH WIZARD - 1-bosqich:
     *   Podstansiya, sana va vaqtni tanlash
     */
    openHisoblagichWizard: async function() {
        // Kerakli ma'lumotlarni yuklash (podstansiya va liniya)
        UI.showLoading(true);
        try {
            if (this.relatedData.podstansiya.length === 0) {
                const podResp = await API.getAll(CONFIG.PAGES.podstansiya.sheet);
                this.relatedData.podstansiya = podResp.data || [];
            }
            if (this.relatedData.liniya.length === 0) {
                const linResp = await API.getAll(CONFIG.PAGES.liniya.sheet);
                this.relatedData.liniya = linResp.data || [];
            }
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
            UI.showLoading(false);
            return;
        }
        UI.showLoading(false);

        // Wizard holatini boshlang'ich qiymatga qaytarish
        this.hisoblagichWizard = {
            step: 1,
            podstansiyaId: null,
            podstansiyaNomi: '',
            sana: new Date().toISOString().split('T')[0],
            vaqt: '00:00',
            liniyalar: []
        };

        document.getElementById('modalTitle').textContent = "Yangi ko'rsatkich qo'shish (1/2)";
        this.renderHisoblagichStep1();
        UI.openModal('dataModal');
    },

    /**
     * Wizard 1-bosqichni chizish
     */
    renderHisoblagichStep1: function() {
        const w = this.hisoblagichWizard;
        const podstansiyaList = this.relatedData.podstansiya || [];

        let podOptions = '<option value="">-- Podstansiyani tanlang --</option>';
        podstansiyaList.forEach(p => {
            const sel = String(w.podstansiyaId) === String(p.id) ? 'selected' : '';
            const label = p.nomi || p.id;
            podOptions += `<option value="${p.id}" ${sel}>${p.id} - ${this.escapeHtml(label)}</option>`;
        });

        const html = `
            <div class="wizard-step">
                <div class="form-field">
                    <label>Podstansiya *</label>
                    <select id="wizPodstansiya" required>${podOptions}</select>
                </div>
                <div class="form-field">
                    <label>Sana *</label>
                    <input type="date" id="wizSana" value="${w.sana}" required>
                </div>
                <div class="form-field">
                    <label>Vaqt *</label>
                    <select id="wizVaqt" required>
                        <option value="00:00" ${w.vaqt==='00:00'?'selected':''}>00:00</option>
                        <option value="04:00" ${w.vaqt==='04:00'?'selected':''}>04:00</option>
                    </select>
                </div>
            </div>
        `;
        document.getElementById('formFields').innerHTML = html;

        // Saqlash tugmasini "Keyingi" ga o'zgartirish
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerHTML = '<span class="material-icons">arrow_forward</span> Keyingi';
        saveBtn.onclick = () => Tables.goToHisoblagichStep2();
    },

    /**
     * 1-bosqichdan 2-bosqichga o'tish
     */
    goToHisoblagichStep2: function() {
        const podId = document.getElementById('wizPodstansiya').value;
        const sana = document.getElementById('wizSana').value;
        const vaqt = document.getElementById('wizVaqt').value;

        if (!podId) { UI.showSnackbar('Podstansiyani tanlang', 'error'); return; }
        if (!sana)  { UI.showSnackbar('Sanani tanlang', 'error'); return; }
        if (!vaqt)  { UI.showSnackbar('Vaqtni tanlang', 'error'); return; }
        if (vaqt !== '00:00' && vaqt !== '04:00') {
            UI.showSnackbar('Vaqt faqat 00:00 yoki 04:00 bo\'lishi mumkin', 'error');
            return;
        }

        const pod = (this.relatedData.podstansiya || []).find(p => String(p.id) === String(podId));
        if (!pod) { UI.showSnackbar('Podstansiya topilmadi', 'error'); return; }

        // Shu podstansiyaga tegishli liniyalarni topish
        const liniyalar = (this.relatedData.liniya || []).filter(l => String(l.p_id) === String(podId));
        if (liniyalar.length === 0) {
            UI.showSnackbar('Bu podstansiyaga tegishli liniyalar topilmadi', 'warning');
            return;
        }

        this.hisoblagichWizard.podstansiyaId = podId;
        this.hisoblagichWizard.podstansiyaNomi = pod.nomi || '';
        this.hisoblagichWizard.sana = sana;
        this.hisoblagichWizard.vaqt = vaqt;
        this.hisoblagichWizard.liniyalar = liniyalar;
        this.hisoblagichWizard.step = 2;

        document.getElementById('modalTitle').textContent = "Liniyalar ko'rsatkichlari (2/2)";
        this.renderHisoblagichStep2();
    },

    /**
     * Wizard 2-bosqichni chizish - liniyalar jadvali (A+, A-, R+, R-)
     */
    renderHisoblagichStep2: function() {
        const w = this.hisoblagichWizard;
        // Sanani DD.MM.YYYY ko'rinishida ko'rsatish
        const [yy, mm, dd] = w.sana.split('-');
        const sanaDisplay = `${dd}.${mm}.${yy}`;

        let html = `
            <div class="wizard-info">
                <div><span class="material-icons">electrical_services</span> <b>Podstansiya:</b> ${this.escapeHtml(w.podstansiyaNomi)}</div>
                <div><span class="material-icons">event</span> <b>Sana:</b> ${sanaDisplay}</div>
                <div><span class="material-icons">schedule</span> <b>Vaqt:</b> ${w.vaqt}</div>
            </div>
            <div class="wizard-table-wrap">
                <table class="wizard-table">
                    <thead>
                        <tr>
                            <th>Liniya nomi</th>
                            <th>A+</th>
                            <th>A-</th>
                            <th>R+</th>
                            <th>R-</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        w.liniyalar.forEach(l => {
            const nomi = l.nomi || l.unique_nomi || ('ID ' + l.id);
            html += `
                <tr data-liniya-id="${l.id}">
                    <td class="liniya-name-cell">${this.escapeHtml(nomi)}</td>
                    <td><input type="number" step="any" class="w-aplus"  data-id="${l.id}" placeholder="A+"></td>
                    <td><input type="number" step="any" class="w-aminus" data-id="${l.id}" placeholder="A-"></td>
                    <td><input type="number" step="any" class="w-rplus"  data-id="${l.id}" placeholder="R+"></td>
                    <td><input type="number" step="any" class="w-rminus" data-id="${l.id}" placeholder="R-"></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('formFields').innerHTML = html;

        // "Saqlash" tugmasi -> batch save
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerHTML = '<span class="material-icons">save</span> Saqlash';
        saveBtn.onclick = () => Tables.saveHisoblagichBatch();

        // "Bekor qilish" tugmasi 1-bosqichga qaytarsa ham bo'ladi.
        // Ammo cancelBtn standart yopish bilan ishlaydi; orqaga qaytish uchun alohida tugma qo'shamiz.
        if (!document.getElementById('wizBackBtn')) {
            const cancelBtn = document.getElementById('cancelBtn');
            const backBtn = document.createElement('button');
            backBtn.id = 'wizBackBtn';
            backBtn.className = 'btn btn-secondary';
            backBtn.innerHTML = '<span class="material-icons">arrow_back</span> Orqaga';
            backBtn.onclick = () => {
                Tables.hisoblagichWizard.step = 1;
                document.getElementById('modalTitle').textContent = "Yangi ko'rsatkich qo'shish (1/2)";
                Tables.renderHisoblagichStep1();
                const b = document.getElementById('wizBackBtn');
                if (b) b.remove();
            };
            cancelBtn.parentNode.insertBefore(backBtn, cancelBtn.nextSibling);
        }
    },

    /**
     * Bir nechta liniya bo'yicha ko'rsatkichlarni saqlash
     */
    saveHisoblagichBatch: async function() {
        const w = this.hisoblagichWizard;
        const rows = [];
        let hasAny = false;
        let hasError = false;

        w.liniyalar.forEach(l => {
            const aPlus  = document.querySelector(`.w-aplus[data-id="${l.id}"]`).value;
            const aMinus = document.querySelector(`.w-aminus[data-id="${l.id}"]`).value;
            const rPlus  = document.querySelector(`.w-rplus[data-id="${l.id}"]`).value;
            const rMinus = document.querySelector(`.w-rminus[data-id="${l.id}"]`).value;

            const allEmpty = !aPlus && !aMinus && !rPlus && !rMinus;
            const someEmpty = !aPlus || !aMinus || !rPlus || !rMinus;

            if (allEmpty) return; // bu liniyani o'tkazib yuborish

            if (someEmpty) {
                hasError = true;
                UI.showSnackbar(`"${l.nomi || l.unique_nomi}" - barcha 4 qiymatni kiriting`, 'error');
                return;
            }

            hasAny = true;
            rows.push({
                p_id: l.id,                                  // liniya id
                liniya_nomi: l.nomi || l.unique_nomi || '',
                sana: w.sana,
                vaqt: w.vaqt,
                a_plyus: aPlus,
                a_minus: aMinus,
                r_plyus: rPlus,
                r_minus: rMinus
            });
        });

        if (hasError) return;
        if (!hasAny) {
            UI.showSnackbar("Hech bo'lmaganda bitta liniya uchun qiymat kiriting", 'warning');
            return;
        }

        UI.showLoading(true);
        const author = Auth.getCurrentUser();
        const page = CONFIG.PAGES.hisoblagich;
        let okCount = 0;
        let errCount = 0;

        try {
            // Ketma-ket saqlash (Apps Script konfliktidan saqlanish uchun)
            for (const data of rows) {
                try {
                    await API.create(page.sheet, data, author);
                    okCount++;
                } catch (err) {
                    errCount++;
                    console.error('Saqlashda xato:', err);
                }
            }

            if (errCount === 0) {
                UI.showSnackbar(`${okCount} ta yozuv muvaffaqiyatli qo'shildi`, 'success');
            } else {
                UI.showSnackbar(`${okCount} ta saqlandi, ${errCount} ta xatolik`, 'warning');
            }

            // Orqaga tugmasini olib tashlash
            const b = document.getElementById('wizBackBtn');
            if (b) b.remove();

            UI.closeModal('dataModal');
            await this.loadData();
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
        } finally {
            UI.showLoading(false);
        }
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
     * Wizard tugmalarini va onclickni tiklash (oddiy modal uchun)
     */
    resetSaveButton: function() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.onclick = null;
            saveBtn.innerHTML = '<span class="material-icons">save</span> Saqlash';
        }
        const b = document.getElementById('wizBackBtn');
        if (b) b.remove();
    },

    /**
     * Form yaratish
     */
    renderForm: function(data = {}) {
        // Oddiy modal uchun wizard holatini tozalash
        this.resetSaveButton();

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
