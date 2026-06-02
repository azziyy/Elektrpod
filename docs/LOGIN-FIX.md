# Login muammosi tuzatildi ✅

## Muammo nima edi?

Dasturda login bosilganda **"Users sheet topilmadi"** xatosi chiqayotgan edi.

**Sabab:** `Code.gs` faqat `Users` nomli varaqni qidirgan, lekin sizning Google Sheets faylida varaq nomi boshqacha (masalan `Login`) edi.

---

## Nima o'zgartirildi?

### 1) `Code.gs` (Google Apps Script — backend)

**a) Foydalanuvchilar varaqasi avtomatik aniqlanadi.**
Endi dastur quyidagi nomlarni tartib bilan sinab ko'radi:

```
Users, Login, Logins, Foydalanuvchilar, Foydalanuvchi, User
```

Topilmasa — barcha varaqalar ichidan nomida `user`, `login`, `foydalanuvchi` so'zi borini qidiradi.

**b) Vaqtinchalik (hardcoded) login qo'shildi.**
Sheet umuman bo'lmasa ham, quyidagi loginlar bilan kirish mumkin:

| Login | Parol |
|-------|-------|
| **Admin** | **1234** |
| admin | 1234 |
| test  | test |

Ular `TEMP_USERS` massivida joylashgan (`Code.gs` ning yuqori qismida).

### 2) `js/auth.js` (frontend)

Frontend tomonda ham aynan **shu hardcoded loginlar** birinchi tekshiriladi.
Bu degani — agar **Apps Script umuman deploy qilinmagan** bo'lsa ham, yoki internet yo'q bo'lsa ham, `Admin / 1234` bilan kirish ishlaydi.

### 3) `index.html` + `css/style.css`

Login oynasi ostida foydalanuvchiga ko'rinadigan eslatma qo'shildi:

> ℹ️ Vaqtinchalik login: **Admin** / **1234**

---

## Test qilish

1. `index.html` ni brauzerda ochib `Admin` / `1234` bilan kiring — darhol ishlashi kerak (Apps Script ga ulanish ham shart emas).
2. Apps Script ni deploy qilib URL-ni `js/config.js` ga qo'ysangiz, **Google Sheets'dagi foydalanuvchilar** ham ishlay boshlaydi (`Javohir / 2025`, `Azizbek / 123456789` — sizning sheetdagi qatorlar).

---

## Dastur tayyor bo'lgach — vaqtinchalik loginni qanday o'chirish?

**1) Frontend tomondan** (`js/auth.js`):
```js
const TEMP_LOGIN_ENABLED = false;   // true -> false
```

**2) Backend tomondan** (`Code.gs`):
```js
const TEMP_USERS = [];   // massivni bo'shating
```

**3) `index.html`** — quyidagi blokni o'chiring:
```html
<div class="login-hint" id="loginHint"> ... </div>
```

Tamom! Endi faqat Google Sheets dagi loginlar orqali kirish mumkin bo'ladi.
