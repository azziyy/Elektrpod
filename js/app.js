/**
 * APP - Asosiy ilova
 * ============================================
 * Barcha eventlarni va boshlang'ich logikani boshqaradi
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Dark mode yuklash
    UI.loadDarkMode();
    
    // Session tekshirish
    if (Auth.checkSession()) {
        startApp();
    } else {
        showLoginPage();
    }
    
    // ========================================
    // LOGIN EVENTS
    // ========================================
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        errorDiv.textContent = '';
        
        // Loading button
        const btn = e.target.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons">hourglass_empty</span> Tekshirilmoqda...';
        btn.disabled = true;
        
        const result = await Auth.login(username, password);
        
        btn.innerHTML = originalContent;
        btn.disabled = false;
        
        if (result.success) {
            startApp();
        } else {
            errorDiv.textContent = result.error || "Login yoki parol noto'g'ri";
            UI.showSnackbar("Login yoki parol noto'g'ri", 'error');
        }
    });
    
    // Parol ko'rsatish
    document.getElementById('togglePassword').addEventListener('click', (e) => {
        const input = document.getElementById('loginPassword');
        if (input.type === 'password') {
            input.type = 'text';
            e.target.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            e.target.textContent = 'visibility';
        }
    });
    
    // Dark mode (login)
    document.getElementById('darkModeToggleLogin').addEventListener('click', UI.toggleDarkMode);
    
    // ========================================
    // MAIN APP EVENTS
    // ========================================
    
    // Drawer toggle
    document.getElementById('menuToggle').addEventListener('click', UI.toggleDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', UI.closeDrawerMobile);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        UI.confirm('Tizimdan chiqishni xohlaysizmi?', () => Auth.logout());
    });
    
    // Dark mode
    document.getElementById('darkModeToggle').addEventListener('click', UI.toggleDarkMode);
    
    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => Tables.loadData());
    document.getElementById('refreshDataBtn').addEventListener('click', () => Tables.loadData());
    
    // Drawer items
    document.querySelectorAll('.drawer-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            Tables.loadPage(page);
        });
    });
    
    // Add button
    document.getElementById('addBtn').addEventListener('click', () => Tables.openAddModal());
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', () => {
        UI.closeModal('dataModal');
        Tables.resetSaveButton();
    });
    document.getElementById('cancelBtn').addEventListener('click', () => {
        UI.closeModal('dataModal');
        Tables.resetSaveButton();
    });
    document.getElementById('saveBtn').addEventListener('click', () => {
        // Wizard rejimida saveBtn.onclick alohida ishlaydi (saveHisoblagichBatch/goToHisoblagichStep2)
        // Faqat oddiy modal uchun saveForm chaqiriladi
        const saveBtn = document.getElementById('saveBtn');
        if (!saveBtn.onclick) {
            Tables.saveForm();
        }
    });
    
    // Modal form submit (Enter tugmasi)
    document.getElementById('dataForm').addEventListener('submit', (e) => {
        e.preventDefault();
        Tables.saveForm();
    });
    
    // Search
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            Tables.search(e.target.value);
        }, 300);
    });
    
    // Filter
    document.getElementById('applyFilterBtn').addEventListener('click', () => Tables.applyFilter());
    document.getElementById('clearFilterBtn').addEventListener('click', () => Tables.clearFilter());
    
    // Export
    document.getElementById('exportExcelBtn').addEventListener('click', () => Export.toExcel());
    document.getElementById('exportPdfBtn').addEventListener('click', () => Export.toPdf());
    
    // ESC tugmasi modal yopish uchun
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(m => {
                m.classList.add('hidden');
                if (m.id === 'dataModal') Tables.resetSaveButton();
            });
        }
    });
    
    // Modal tashqarisiga bosish
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                if (modal.id === 'dataModal') Tables.resetSaveButton();
            }
        });
    });
});

/**
 * Login sahifasini ko'rsatish
 */
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

/**
 * Asosiy ilovani boshlash
 */
function startApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Foydalanuvchi nomi
    document.getElementById('currentUser').textContent = Auth.getCurrentUser();
    
    // Boshlang'ich sahifa: Podstansiyalar
    Tables.loadPage('podstansiya');
}
