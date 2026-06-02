/**
 * UI - Foydalanuvchi interfeysi yordamchi funksiyalari
 * ============================================
 */

const UI = {
    
    /**
     * Snackbar (Toast) ko'rsatish
     */
    showSnackbar: function(message, type = 'info', duration = 3000) {
        const snackbar = document.getElementById('snackbar');
        snackbar.textContent = message;
        snackbar.className = 'snackbar show ' + type;
        
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, duration);
    },
    
    /**
     * Loading overlay
     */
    showLoading: function(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    },
    
    /**
     * Modal ochish
     */
    openModal: function(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    },
    
    /**
     * Modal yopish
     */
    closeModal: function(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    },
    
    /**
     * Tasdiqlash dialogi
     */
    confirm: function(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        this.openModal('confirmModal');
        
        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');
        
        const handleOk = () => {
            this.closeModal('confirmModal');
            onConfirm();
            cleanup();
        };
        
        const handleCancel = () => {
            this.closeModal('confirmModal');
            cleanup();
        };
        
        const cleanup = () => {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    },
    
    /**
     * Drawer ochish/yopish
     */
    toggleDrawer: function() {
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawerOverlay');
        const content = document.querySelector('.content');
        
        if (window.innerWidth <= 1024) {
            // Mobil rejim
            drawer.classList.toggle('open');
            overlay.classList.toggle('active');
        } else {
            // Desktop rejim
            drawer.classList.toggle('closed');
            content.classList.toggle('full-width');
        }
    },
    
    closeDrawerMobile: function() {
        if (window.innerWidth <= 1024) {
            document.getElementById('drawer').classList.remove('open');
            document.getElementById('drawerOverlay').classList.remove('active');
        }
    },
    
    /**
     * Dark mode toggle
     */
    toggleDarkMode: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('elektr_darkmode', isDark);
        
        // Iconni yangilash
        document.querySelectorAll('#darkModeToggle .material-icons, #darkModeToggleLogin .material-icons')
            .forEach(icon => {
                icon.textContent = isDark ? 'light_mode' : 'dark_mode';
            });
    },
    
    /**
     * Saqlangan dark mode rejimini yuklash
     */
    loadDarkMode: function() {
        const isDark = localStorage.getItem('elektr_darkmode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.querySelectorAll('#darkModeToggle .material-icons, #darkModeToggleLogin .material-icons')
                .forEach(icon => {
                    icon.textContent = 'light_mode';
                });
        }
    },
    
    /**
     * Sahifani sozlash (tab almashganda)
     */
    setActivePage: function(pageKey) {
        const page = CONFIG.PAGES[pageKey];
        if (!page) return;
        
        // Sahifa sarlavhasini o'zgartirish
        document.getElementById('pageTitle').textContent = page.title;
        
        // Drawer da active item
        document.querySelectorAll('.drawer-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageKey);
        });
        
        // Filter panelni ko'rsatish/yashirish
        const filterPanel = document.getElementById('filterPanel');
        if (page.hasFilter) {
            filterPanel.classList.remove('hidden');
        } else {
            filterPanel.classList.add('hidden');
        }
        
        // Mobil da drawer ni yopish
        this.closeDrawerMobile();
    }
};
