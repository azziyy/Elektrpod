/**
 * EXPORT - Excel va PDF eksport
 * ============================================
 */

const Export = {
    
    /**
     * Excel ga eksport
     */
    toExcel: function() {
        const page = CONFIG.PAGES[Tables.currentPage];
        const data = Tables.filteredData;
        
        if (!data || data.length === 0) {
            UI.showSnackbar("Eksport uchun ma'lumot yo'q", 'warning');
            return;
        }
        
        try {
            // Sarlavhalar
            const headers = page.columns.map(col => col.label);
            headers.push('Tahrirlangan vaqti');
            
            // Ma'lumotlar
            const rows = data.map(row => {
                const arr = page.columns.map(col => {
                    let value = row[col.key] || '';
                    if (col.type === 'date' && value) {
                        value = CONFIG.formatDate(value);
                    }
                    return value;
                });
                arr.push(CONFIG.formatDateTime(row.updated_at || row.created_at));
                return arr;
            });
            
            // Workbook yaratish
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            
            // Ustun kengligini avtomatik sozlash
            const colWidths = headers.map((h, i) => {
                let maxLen = h.length;
                rows.forEach(r => {
                    const len = String(r[i] || '').length;
                    if (len > maxLen) maxLen = len;
                });
                return { wch: Math.min(maxLen + 2, 30) };
            });
            ws['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(wb, ws, page.title.substring(0, 30));
            
            // Faylni yuklab olish
            const fileName = `${page.title}_${this.getDateStr()}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            UI.showSnackbar("Excel fayl yuklab olindi", 'success');
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
            console.error(error);
        }
    },
    
    /**
     * PDF ga eksport
     */
    toPdf: function() {
        const page = CONFIG.PAGES[Tables.currentPage];
        const data = Tables.filteredData;
        
        if (!data || data.length === 0) {
            UI.showSnackbar("Eksport uchun ma'lumot yo'q", 'warning');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: data.length > 0 && Object.keys(data[0]).length > 6 ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Sarlavha
            doc.setFontSize(16);
            doc.text(page.title, 14, 15);
            
            doc.setFontSize(10);
            doc.text(`Sana: ${CONFIG.formatDateTime(new Date())}`, 14, 22);
            doc.text(`Jami: ${data.length} ta yozuv`, 14, 28);
            
            // Jadval
            const headers = page.columns.map(col => col.label);
            headers.push('Tahrirlangan');
            
            const rows = data.map(row => {
                const arr = page.columns.map(col => {
                    let value = row[col.key] || '';
                    if (col.type === 'date' && value) {
                        value = CONFIG.formatDate(value);
                    }
                    return String(value);
                });
                arr.push(CONFIG.formatDateTime(row.updated_at || row.created_at));
                return arr;
            });
            
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: 33,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250]
                }
            });
            
            // Faylni yuklab olish
            const fileName = `${page.title}_${this.getDateStr()}.pdf`;
            doc.save(fileName);
            
            UI.showSnackbar("PDF fayl yuklab olindi", 'success');
        } catch (error) {
            UI.showSnackbar('Xatolik: ' + error.message, 'error');
            console.error(error);
        }
    },
    
    /**
     * Sana qatorini olish
     */
    getDateStr: function() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
};
