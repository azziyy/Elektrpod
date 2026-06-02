# 📋 O'RNATISH BO'YICHA TO'LIQ QO'LLANMA

Bu qo'llanma sizga Elektr Hisoblagich Tizimini noldan ishga tushirishda yordam beradi.

---

## 🎯 1-QADAM: Google Sheets ni tayyorlash

### 1.1. Mavjud sheetga kiring
URL: https://docs.google.com/spreadsheets/d/1QKPSqZFhVO8ythj8BV5dHPDXs9L3Gbwp2N-X7oT7gs4/edit

### 1.2. Sheet (tab) nomlarini tekshiring
Quyidagi nomlar bo'lishi shart (katta-kichik harf farq qiladi):
- `Podstansiya`
- `Liniya`
- `Hisoblagich`
- `Users`

### 1.3. Ustunlar tartibi

**📋 Podstansiya sheet:**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| id | nomi | kuchlanishi | created_at | updated_at | author |

**📋 Liniya sheet:**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | p_id | nomi | unique_nomi | kuchlanish | created_at | updated_at | author |

**📋 Hisoblagich sheet:**
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| id | p_id | liniya_nomi | sana | vaqt | a_plyus | a_minus | r_plyus | r_minus | author | created_at | updated_at |

**📋 Users sheet:**
| A | B |
|---|---|
| username | password |

> ⚠️ Birinchi qator header (sarlavha) bo'lishi mumkin yoki bo'lmasligi mumkin - kod ikkalasini ham tushunadi.

---

## 🛠 2-QADAM: Google Apps Script ni sozlash

### 2.1. Apps Script ni ochish
1. Google Sheets ni oching
2. Yuqoridagi menyudan: **Extensions** → **Apps Script** ni bosing
3. Yangi proyekt oynasi ochiladi

### 2.2. Kodni joylash
1. `Code.gs` faylining ichidagi BARCHA kodini o'chiring
2. Berilgan **`Code.gs`** fayl mazmunini to'liq nusxalab joylang
3. **MUHIM**: `SHEET_ID` to'g'ri ekanligini tekshiring:
   ```javascript
   const SHEET_ID = '1QKPSqZFhVO8ythj8BV5dHPDXs9L3Gbwp2N-X7oT7gs4';
   ```
4. **Saqlang**: Yuqoridagi disk ikonkasini bosing (Ctrl+S)
5. Proyekt nomini bering: masalan, "Elektr API"

### 2.3. Birinchi marta ruxsat berish
1. Funksiyalar ro'yxatidan `testGetAll` ni tanlang
2. **Run** (▶️) tugmasini bosing
3. "Authorization required" oynasi chiqsa:
   - **Review permissions** ni bosing
   - Google akkauntingizni tanlang
   - "Advanced" → "Go to [proyekt nomi] (unsafe)" ni bosing
   - **Allow** ni bosing
4. Execution log ochilishi va ma'lumotlar ko'rinishi kerak

### 2.4. (Ixtiyoriy) Sheetlarni avtomatik sozlash
Agar sheetlar bo'sh yoki noto'g'ri tuzilgan bo'lsa:
1. `setupSheets` funksiyasini tanlang
2. **Run** ni bosing
3. Bu sheetlarni avtomatik ustunlar bilan to'ldiradi

---

## 🌐 3-QADAM: Web App sifatida Deploy qilish

### 3.1. Deploy
1. Apps Script da yuqori o'ngdagi **Deploy** → **New deployment** ni bosing
2. **Select type** (tishli ikonka) → **Web app** ni tanlang
3. Sozlamalar:
   - **Description**: "Elektr API v1"
   - **Execute as**: **Me** (Sizning akkauntingiz)
   - **Who has access**: **Anyone** (Hamma)
   > ⚠️ "Anyone" bo'lishi muhim! Aks holda CORS xatoligi chiqadi
4. **Deploy** tugmasini bosing
5. **Web app URL** ni nusxalang. U taxminan shunday ko'rinadi:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

### 3.2. URL ni saqlab qo'ying
Bu URL keyingi qadamda kerak bo'ladi!

---

## ⚙️ 4-QADAM: Frontend ni sozlash

### 4.1. `js/config.js` faylini oching
Matn redaktor (VS Code, Notepad++ va h.k.) bilan oching.

### 4.2. API_URL ni yangilang
```javascript
const CONFIG = {
    API_URL: 'SIZNING_APPS_SCRIPT_URL_INGIZ', // ← BU YERGA YOZING
    ...
};
```

Masalan:
```javascript
API_URL: 'https://script.google.com/macros/s/AKfycbxABCDEFG.../exec',
```

### 4.3. Saqlang

---

## 🚀 5-QADAM: Ishga tushirish

### Variant A: Brauzerda lokal ochish
1. `index.html` faylini brauzerda oching (double click)
2. Login sahifasi chiqishi kerak

### Variant B: Lokal server (tavsiya etiladi)
Lokal serverda ishga tushirish CORS muammolarini oldini oladi.

**Python bilan:**
```bash
cd elektr_app
python -m http.server 8000
```
Brauzerda: `http://localhost:8000`

**Node.js bilan:**
```bash
cd elektr_app
npx http-server -p 8000
```

### Variant C: GitHub Pages ga deploy
1. Loyihani GitHub ga upload qiling
2. Settings → Pages dan yoqing
3. URL orqali kiring

---

## ✅ 6-QADAM: Test qilish

### 6.1. Login
1. Users sheet da yozilgan login/parol bilan kiring
2. Masalan: `javohir` / `parolingiz`

### 6.2. Ma'lumotlarni ko'rish
- Podstansiyalar tab - barcha podstansiyalar ko'rinadi
- Liniyalar tab - barcha liniyalar
- Hisoblagich ko'rsatkichlari - barcha ko'rsatkichlar

### 6.3. CRUD test
- "Qo'shish" → yangi yozuv qo'shing
- Tahrirlash → mavjud yozuvni o'zgartiring
- O'chirish → yozuvni o'chiring
- Google Sheets ni tekshiring - hammasi sinxron yangilanadi

---

## 🐛 Muammolarni hal qilish

### ❌ "Failed to fetch" yoki CORS xatoligi
**Sabab**: Apps Script Deploy noto'g'ri sozlangan
**Yechim**:
1. Apps Script → Deploy → Manage deployments
2. Edit (qalam) → Who has access: **Anyone**
3. Update qiling
4. Yangi URL ni `config.js` ga yozing

### ❌ "Login yoki parol noto'g'ri"
**Sabab**: Users sheet noto'g'ri to'ldirilgan
**Yechim**:
- Users sheet da A ustun = username, B ustun = password
- Bo'sh joy (probel) bo'lmasligi kerak
- Katta-kichik harf farq qiladi

### ❌ Ma'lumotlar yuklanmayapti
**Yechim**:
1. F12 (Developer Tools) → Console ni oching
2. Xatolikni o'qing
3. Apps Script da `testGetAll` funksiyasini ishga tushiring
4. Agar test ishlasa - frontend muammosi, agar ishlamasa - sheet sozlamasini tekshiring

### ❌ Apps Script da "Exception: You do not have permission"
**Yechim**: 
- Run tugmasini bosing va permission bering
- Yoki Spreadsheet ni boshqa akkauntdan ochib turgan bo'lsangiz, Apps Script ham o'sha akkauntdan ochilsin

### ❌ Yangi yozuv qo'shilmayapti
**Yechim**: Sheet ustunlari tartibini tekshiring (yuqoridagi jadvalga qarang)

---

## 📞 Foydalanuvchi qo'shish

`Users` sheet ga yangi qator qo'shing:
| A (username) | B (password) |
|--------------|--------------|
| javohir | mypassword |
| azimjon | securepass123 |
| admin | admin2026 |

> ⚠️ Hozircha parollar sodda matn ko'rinishida. Production uchun hash qo'llang!

---

## 🔄 Yangilanishlar

Agar Apps Script kodini o'zgartirsangiz:
1. Saqlang (Ctrl+S)
2. Deploy → Manage deployments
3. Edit (qalam) → Version: **New version**
4. Deploy ni bosing
5. URL o'zgarmaydi - frontend qayta sozlash shart emas

---

## ✨ Tabriklaymiz!

Sizning Elektr Hisoblagich Tizimingiz tayyor! 🎉

Savollar bo'lsa, README.md ga ham qarang.
