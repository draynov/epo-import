# Supabase Integration Setup

Supabase интеграцията е готова! Следвайте стъпките по-долу за да завършите настройката.

## ✅ Готови компоненти:

1. **Supabase Client** - `src/lib/supabase/client.ts`
2. **Auth System** - Login/Register + Protected Routes
3. **Database Schema** - SQL файл за създаване на таблиците
4. **Storage Services** - Supabase-based portfolio & subsection storage
5. **Protected Pages** - Всички страници изискват login

---

## 📋 Следващи стъпки:

### 1. Създайте database tables в Supabase

Отворете **Supabase SQL Editor**:
- https://supabase.com/dashboard/project/njjjjieldefgobrpsvsk/sql

**Copy-paste** SQL кода от файла:
```
supabase/schema.sql
```

Стартирайте скрипта с бутон **RUN**.

---

### 2. Създайте test user

В **Supabase Dashboard**:
- Authentication → Users → **Add user**
- Email: `admin@epo.bg` (или друг)
- Password: `admin123` (или друг)
- ✓ Auto Confirm User

---

### 3. Рестартирайте dev server

```powershell
# Спрете текущия сървър (Ctrl+C) и стартирайте отново
npm run dev
```

---

### 4. Тествайте login

Отворете браузър на `http://localhost:3000`

Ще бъдете redirect-нати към `/login`

Влезте с email и password от стъпка 2.

---

## 🔄 Migration на съществуващи данни (optional)

Ако имате портфолиа в localStorage:

1. Първо ще се логнете
2. Отворете **Developer Tools** → Console
3. Изпълнете:

```javascript
// Вземете localStorage данни
const portfolios = JSON.parse(localStorage.getItem('epo_portfolios') || '[]');
console.log('Portfolios:', portfolios);

// Копирайте изхода и ми го пратете
// Ще създам migration script
```

---

## 🏗️ Архитектура:

### Файлове:
```
src/
├── lib/
│   ├── supabase/
│   │   └── client.ts                    # Supabase config
│   ├── auth/
│   │   ├── auth-context.tsx             # Auth state management
│   │   └── protected-route.tsx          # Route guard
│   └── storage/
│       ├── supabase-portfolio-storage.ts      # NEW: Supabase portfolios
│       ├── supabase-subsection-data-storage.ts # NEW: Supabase data
│       ├── portfolio-storage.ts               # OLD: localStorage (keep for now)
│       └── subsection-data-storage.ts         # OLD: localStorage (keep for now)
├── app/
│   ├── login/
│   │   └── page.tsx                     # Login/Register page
│   └── portfolios/
│       └── template.tsx                 # Protected wrapper
└── components/
    └── layout/
        └── header.tsx                   # Updated with logout button

supabase/
└── schema.sql                           # Database schema
```

### Database:
```sql
- portfolios (user_id, name, epo_user_id, epo_portfolio_id)
- portfolio_data (portfolio_id, subsection_id, data JSONB)
```

### RLS Policies:
- Users can only see/edit their own data
- Row Level Security enabled on all tables

---

## 🚧 TODO (Next Phase):

1. **Replace localStorage calls** with Supabase storage
   - Update `PortfolioList` component
   - Update `PortfolioEditorPage`
   - Update `ImportPdfPage`

2. **Test all functionality**:
   - Create portfolio
   - Edit portfolio
   - Delete portfolio
   - Import from HTML
   - Logout/Login persistence

3. **Error handling**:
   - Network errors
   - Auth errors
   - Validation errors

---

## 🔑 Credentials (.env.local):

```
NEXT_PUBLIC_SUPABASE_URL=https://njjjjieldefgobrpsvsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**⚠️ Не commit-вайте .env.local!** (вече е в .gitignore)

---

## 💡 Notes:

- **Auth Context** е global provider в root layout
- **Protected Routes** работят автоматично за всички `/portfolios/*` страници
- **Login page** е публична (без auth)
- **Logout button** е в header (само за logged in users)
- **User email** се показва в header

---

Готови сте! 🎉

След създаване на таблиците и test user, приложението ще работи с Supabase.
