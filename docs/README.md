# ⚡ Elektr Hisoblagich Tizimi

Google Sheets bilan integratsiya qilingan web dastur. Material Design uslubida, mobil moslashuvchan, dark mode bilan.

## 🎯 Imkoniyatlar

- ✅ **Login tizimi** - Foydalanuvchilar `Users` sheet dan tekshiriladi
- ✅ **3 ta bo'lim**: Podstansiyalar, Liniyalar, Hisoblagich ko'rsatkichlari
- ✅ **To'liq CRUD**: Qo'shish, ko'rish, tahrirlash, o'chirish
- ✅ **Vaqt bo'yicha filter** - Hisoblagich uchun
- ✅ **Qidirish** - barcha ustunlar bo'yicha
- ✅ **Material Design** - zamonaviy va chiroyli
- ✅ **Responsive** - mobil va planshetga moslashgan
- ✅ **Dark Mode** - qorong'u rejim
- ✅ **Excel/PDF eksport** - hisobotlar uchun
- ✅ **Tahrirlangan vaqt** - har bir yozuv uchun avtomatik

## 📁 Fayl tuzilmasi

```
elektr_app/
├── index.html          ← Asosiy HTML
├── Code.gs             ← Google Apps Script kodi
├── css/
│   └── style.css       ← Material Design uslubi
├── js/
│   ├── config.js       ← Konfiguratsiya (API URL bu yerda!)
│   ├── api.js          ← Apps Script bilan aloqa
│   ├── auth.js         ← Login tizimi
│   ├── ui.js           ← UI yordamchilari
│   ├── tables.js       ← Jadval boshqaruvi (CRUD)
│   ├── export.js       ← Excel/PDF eksport
│   └── app.js          ← Asosiy ilova
└── docs/
    ├── README.md       ← Bu fayl
    └── SETUP.md        ← O'rnatish bo'yicha qo'llanma
```

## 🚀 Tez boshlash

1. **Google Apps Script ni o'rnating** - [SETUP.md](SETUP.md) ga qarang
2. **Web App URL ni oling** - Deploy qilgandan keyin
3. **`js/config.js` faylini oching** va `API_URL` ni yangilang:
   ```javascript
   API_URL: 'SIZNING_APPS_SCRIPT_URL_INGIZ'
   ```
4. **`index.html` ni brauzerda oching** yoki istalgan web server'da host qiling

## 💡 Foydalanish

### Login
- `Users` sheet da yozilgan login va parol bilan kiring
- A ustun = username, B ustun = password

### Ma'lumot qo'shish
1. Drawer dan kerakli bo'limni tanlang
2. "Qo'shish" tugmasini bosing
3. Maydonlarni to'ldiring
4. "Saqlash" ni bosing

### Tahrirlash
1. Jadvalda kerakli qatorda **edit** (✏️) tugmasini bosing
2. O'zgartirishlarni kiriting
3. "Saqlash" ni bosing

### O'chirish
1. Jadvalda **delete** (🗑️) tugmasini bosing
2. Tasdiqlang

### Filter (Hisoblagich)
- Boshlanish va tugash sanasini tanlang
- Vaqtni tanlang (ixtiyoriy)
- "Filter" tugmasini bosing

### Eksport
- "Excel" tugmasi - .xlsx faylga eksport
- "PDF" tugmasi - .pdf faylga eksport
- Filtrlangan ma'lumotlar eksport qilinadi

### Dark Mode
- Yuqori o'ng burchakdagi **dark_mode** ikonkasini bosing

## 🛠 Texnologiyalar

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ramka yo'q)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Stil**: Material Design (Google)
- **Eksport**: SheetJS (Excel), jsPDF (PDF)
- **Fontlar**: Roboto, Material Icons

## 🔒 Xavfsizlik bo'yicha eslatma

⚠️ **DIQQAT**: Bu oddiy ilova bo'lib, parollar Google Sheets da ochiq holda saqlanadi.
Production muhitida quyidagilarni qiling:
- Parollarni hash qiling (SHA-256 yoki bcrypt)
- HTTPS dan foydalaning
- Session token tizimini qo'shing
- Rate limiting qo'ying

## 📝 Litsenziya

Bu loyiha bepul foydalanish uchun.
