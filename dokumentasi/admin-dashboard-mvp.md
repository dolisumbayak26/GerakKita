# GerakKita Admin Dashboard - MVP Documentation

## 📋 Project Overview

Dashboard admin GerakKita adalah aplikasi web-only yang digunakan untuk mengelola seluruh operasional sistem bus tracking. Dashboard ini memberikan akses penuh kepada administrator untuk monitoring dan manajemen data bus, user, driver, route, dan transaksi.

### Target Pengguna
- **Admin Perusahaan Bus**: Mengelola armada dan operasional
- **Super Admin**: Monitoring keseluruhan sistem

### Platform
- **Web-only** (Desktop/Laptop - tidak untuk mobile)
- Akses melalui browser modern (Chrome, Firefox, Safari, Edge)

---

## 🎯 Core Features (MVP)

### 1. **Dashboard Overview**
![Dashboard Mockup](file:///C:/Users/BRAM/.gemini/antigravity/brain/1706b1ff-dc3e-4943-b833-216d5a77a37b/uploaded_image_1768995941299.png)

**Fitur:**
- Total registered users (real-time)
- Total active buses (currently on route)
- Today's transactions (amount & revenue)
- Active wallet balance (total saldo user)
- Weekly bus usage chart (bar chart)
- Monthly transaction volume (line chart)
- Recent transactions table (latest 10)

**Metrics:**
- Total User Registered + growth percentage
- Active Buses count
- Today's Transactions + revenue
- Active Wallet balance

---

### 2. **Bus Management**

**Fitur CRUD:**
- ✅ **Create**: Tambah bus baru
- ✅ **Read**: List semua bus dengan filter & search
- ✅ **Update**: Edit informasi bus
- ✅ **Delete**: Hapus bus (soft delete)

**Data Bus:**
```typescript
{
  bus_number: string          // Nomor bus (unique)
  license_plate: string       // Plat nomor
  capacity: number            // Kapasitas penumpang
  status: 'active' | 'maintenance' | 'inactive'
  route_id: string            // Route yang assigned
  current_location?: {        // Lokasi real-time
    latitude: number
    longitude: number
  }
  last_maintenance?: Date
  created_at: Date
  updated_at: Date
}
```

**View Features:**
- Table dengan pagination
- Filter by status & route
- Search by bus number / license plate
- Live tracking status indicator
- Quick actions (Edit, Delete, View Details)

---

### 3. **User Management**

**Fitur CRUD:**
- ✅ **Create**: Tambah user manual (optional)
- ✅ **Read**: List semua users
- ✅ **Update**: Edit profile user, update wallet balance
- ✅ **Delete**: Soft delete / ban user

**Data User:**
```typescript
{
  id: string
  full_name: string
  email: string
  phone: string
  wallet_balance: number
  pin_hash?: string           // Encrypted PIN wallet
  role: 'customer' | 'driver' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  total_trips: number
  total_spent: number
  created_at: Date
  last_login?: Date
}
```

**View Features:**
- Table dengan pagination & sorting
- Filter by role & status
- Search by name, email, phone
- Quick wallet top-up
- View transaction history per user
- Reset PIN wallet capability

---

### 4. **Driver Management**

**Fitur CRUD:**
- ✅ **Create**: Register driver baru
- ✅ **Read**: List semua driver
- ✅ **Update**: Edit profile, assign bus
- ✅ **Delete**: Deactivate driver

**Data Driver:**
```typescript
{
  user_id: string             // Foreign key to users
  license_number: string      // Nomor SIM
  license_expiry: Date        // Expired SIM
  assigned_bus_id?: string    // Bus yang di-assign
  status: 'available' | 'on_trip' | 'off_duty'
  rating: number              // Average rating
  total_trips: number
  join_date: Date
  is_active: boolean
}
```

**View Features:**
- Table with driver stats
- Filter by status & assigned bus
- Search by name / license number
- Assign/Unassign bus
- View driver performance (rating, trips)
- View driver location (when on trip)

---

### 5. **Transaction Management**

**Fitur:**
- ✅ **Read**: View all transactions
- ✅ **Filter**: By date range, status, payment method
- ✅ **Export**: Download CSV/Excel report

**Data Transaction:**
```typescript
{
  id: string
  user_id: string
  ticket_id?: string
  type: 'ticket_purchase' | 'wallet_topup' | 'refund'
  amount: number
  payment_method: 'midtrans' | 'wallet'
  status: 'pending' | 'success' | 'failed' | 'refunded'
  midtrans_order_id?: string
  metadata?: {
    route_id?: string
    bus_id?: string
    pickup_point?: string
    dropoff_point?: string
  }
  created_at: Date
  completed_at?: Date
}
```

**View Features:**
- Table with advanced filters
- Real-time status updates
- Search by transaction ID / user
- Date range picker
- Revenue analytics
- Refund capability
- Export to CSV/Excel

---

## 🛠 Tech Stack Recommendation

### **Frontend**
```
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Library: shadcn/ui
Charts: Recharts
Tables: TanStack Table (React Table v8)
Forms: React Hook Form + Zod validation
State: Zustand (for global state)
```

### **Backend/Database**
```
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Real-time: Supabase Realtime subscriptions
Storage: Supabase Storage (for documents/images)
```

### **Development Tools**
```
Package Manager: npm / pnpm
Code Quality: ESLint + Prettier
Git: GitHub
Deployment: Vercel (recommended)
```

---

## 🗄 Database Schema Requirements

### **New Tables**

#### `admin_users`
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `admin_activity_logs`
```sql
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  resource_type TEXT NOT NULL, -- 'bus', 'user', 'driver', etc
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Existing Tables Updates**

Pastikan tables berikut sudah ada dan sesuai:
- ✅ `users` (dari mobile app)
- ✅ `buses` (dari mobile app)
- ✅ `drivers` (dari mobile app)
- ✅ `transactions` (dari mobile app)
- ✅ `tickets` (dari mobile app)
- ✅ `routes` (dari mobile app)
- ✅ `bus_stops` (dari mobile app)

---

## 📂 Project Structure

```
GerakKitaAdmin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── buses/
│   │   │   │   ├── page.tsx          # Bus list
│   │   │   │   ├── [id]/             # Bus detail
│   │   │   │   └── new/              # Create bus
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── drivers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   └── transactions/
│   │   │       └── page.tsx
│   │   ├── api/                      # API routes (optional)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentTransactions.tsx
│   │   ├── charts/
│   │   │   ├── WeeklyUsageChart.tsx
│   │   │   └── TransactionVolumeChart.tsx
│   │   └── forms/
│   │       ├── BusForm.tsx
│   │       ├── UserForm.tsx
│   │       └── DriverForm.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase browser client
│   │   │   ├── server.ts             # Supabase server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── utils.ts                  # Utility functions
│   │   └── validations.ts            # Zod schemas
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBuses.ts
│   │   ├── useUsers.ts
│   │   ├── useDrivers.ts
│   │   └── useTransactions.ts
│   │
│   ├── types/
│   │   ├── database.ts               # Supabase types
│   │   ├── bus.ts
│   │   ├── user.ts
│   │   ├── driver.ts
│   │   └── transaction.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── logo.png
│   └── favicon.ico
│
├── .env.local                        # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔐 Authentication & Authorization

### **Login Flow**
1. Admin login menggunakan email & password
2. Supabase Auth menghandle authentication
3. Session disimpan di cookies (httpOnly)
4. Redirect ke dashboard setelah login sukses

### **Authorization Levels**
- **Super Admin**: Full access ke semua fitur
- **Admin**: Access terbatas (tidak bisa delete, hanya read & update)

### **Protected Routes**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 🎨 UI/UX Design Principles

### **Color Scheme** (dari mockup)
- **Background**: Dark theme (#0F172A, #1E293B)
- **Cards**: Semi-transparent dark (#1E293B80)
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)

### **Typography**
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: JetBrains Mono (untuk angka/kode)

### **Components Style**
- Rounded corners (border-radius: 8px)
- Subtle shadows
- Glassmorphism effects on cards
- Smooth transitions (200ms ease)

### **Responsive Design**
- Sidebar collapsible di mobile
- Table horizontal scroll di mobile
- Charts responsive & touch-friendly

---

## 🚀 Implementation Phases

### **Phase 1: Project Setup** (Day 1-2)
- [ ] Initialize Next.js project
- [ ] Setup Tailwind CSS & shadcn/ui
- [ ] Configure Supabase client
- [ ] Setup TypeScript types from database
- [ ] Create basic layout (Sidebar + Header)
- [ ] Implement authentication (Login page)

### **Phase 2: Dashboard Overview** (Day 3-4)
- [ ] Create stats cards components
- [ ] Implement Recharts for graphs
  - [ ] Weekly bus usage (Bar Chart)
  - [ ] Monthly transaction volume (Line Chart)
- [ ] Create recent transactions table
- [ ] Connect to Supabase for real-time data
- [ ] Add loading states & error handling

### **Phase 3: Bus Management** (Day 5-7)
- [ ] Create buses table with TanStack Table
- [ ] Implement CRUD operations
  - [ ] Create bus form with validation
  - [ ] Edit bus modal
  - [ ] Delete confirmation dialog
- [ ] Add filters (status, route)
- [ ] Add search functionality
- [ ] Show real-time bus location (optional: embed map)

### **Phase 4: User Management** (Day 8-10)
- [ ] Create users table
- [ ] Implement CRUD operations
- [ ] Add wallet management
  - [ ] Top-up wallet modal
  - [ ] View transaction history
  - [ ] Reset PIN functionality
- [ ] User filters & search
- [ ] Export user list to CSV

### **Phase 5: Driver Management** (Day 11-13)
- [ ] Create drivers table
- [ ] Implement CRUD operations
- [ ] Bus assignment feature
- [ ] Driver performance metrics
- [ ] License expiry notifications
- [ ] Filter & search functionality

### **Phase 6: Transaction Management** (Day 14-16)
- [ ] Create transactions table
- [ ] Advanced filtering
  - [ ] Date range picker
  - [ ] Status filter
  - [ ] Payment method filter
- [ ] Transaction details modal
- [ ] Refund functionality
- [ ] Export to CSV/Excel
- [ ] Revenue analytics dashboard

### **Phase 7: Polish & Deploy** (Day 17-18)
- [ ] Add loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Activity logs for admin actions
- [ ] Final testing
- [ ] Deploy to Vercel
- [ ] Setup custom domain (optional)

---

## 📊 Key Performance Indicators (KPI)

Dashboard harus menampilkan KPI berikut:

1. **Operational Metrics**
   - Total active buses vs. idle buses
   - Average trips per bus per day
   - Bus utilization rate (%)

2. **User Metrics**
   - Total registered users
   - Active users (last 7 days)
   - New user registration (daily/weekly)

3. **Revenue Metrics**
   - Daily/Weekly/Monthly revenue
   - Revenue by payment method
   - Average transaction value

4. **Driver Metrics**
   - Total active drivers
   - Average driver rating
   - Drivers on trip vs. available

---

## 🔒 Security Considerations

### **Data Protection**
- [ ] Implement Row Level Security (RLS) di Supabase
- [ ] Hash password menggunakan bcrypt
- [ ] HTTPS only (enforced by Vercel)
- [ ] Rate limiting untuk API calls

### **Input Validation**
- [ ] Client-side validation dengan Zod
- [ ] Server-side validation
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS protection

### **Audit Trail**
- [ ] Log semua admin actions
- [ ] Track who created/updated/deleted data
- [ ] IP address logging
- [ ] Timestamp untuk setiap action

---

## 📱 API Integration

### **Supabase Client Example**

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()

// Example: Fetch all buses
export async function getBuses() {
  const { data, error } = await supabase
    .from('buses')
    .select(`
      *,
      route:routes(id, name),
      driver:drivers(user:users(full_name))
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Example: Real-time subscription
export function subscribeToBuses(callback: (payload: any) => void) {
  return supabase
    .channel('buses-channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'buses' },
      callback
    )
    .subscribe()
}
```

---

## 🧪 Testing Strategy

### **Unit Tests**
- Utility functions
- Validation schemas
- Custom hooks

### **Integration Tests**
- API routes
- Database queries
- Authentication flow

### **E2E Tests** (Optional)
- Critical user flows
- CRUD operations
- Login/Logout

### **Manual Testing Checklist**
- [ ] Login dengan credentials yang benar
- [ ] Login dengan credentials salah (error handling)
- [ ] Create, Read, Update, Delete untuk setiap module
- [ ] Filter & search functionality
- [ ] Real-time updates
- [ ] Export data
- [ ] Responsive design di berbagai ukuran layar

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-table": "^8.10.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.53.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🚀 Getting Started Commands

```bash
# 1. Create Next.js project
cd C:\Users\BRAM
npx create-next-app@latest GerakKitaAdmin

# Choose options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: Yes (@/*)

# 2. Navigate to project
cd GerakKitaAdmin

# 3. Install additional dependencies
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install @tanstack/react-table recharts
npm install react-hook-form @hookform/resolvers zod
npm install zustand date-fns lucide-react
npm install clsx tailwind-merge

# 4. Install shadcn/ui
npx shadcn-ui@latest init

# 5. Add shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast

# 6. Create .env.local file
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key" >> .env.local

# 7. Run development server
npm run dev
```

---

## 📚 Resources & References

### **Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Table](https://tanstack.com/table/v8)
- [Recharts](https://recharts.org/)

### **Design Inspiration**
- [Vercel Analytics Dashboard](https://vercel.com/analytics)
- [Supabase Dashboard](https://app.supabase.com/)
- [Tailwind UI Components](https://tailwindui.com/)

---

## ✅ Success Criteria

MVP dianggap berhasil jika:

1. ✅ Admin bisa login dan logout dengan aman
2. ✅ Dashboard menampilkan real-time statistics
3. ✅ Semua 5 modules (Bus, User, Driver, Transaction, Dashboard) berfungsi
4. ✅ CRUD operations bekerja untuk Bus, User, Driver
5. ✅ Transaction dapat difilter dan di-export
6. ✅ UI responsive dan sesuai dengan mockup
7. ✅ Real-time updates berfungsi (optional tapi recommended)
8. ✅ Deploy berhasil ke Vercel

---

## 🎯 Next Steps After MVP

Setelah MVP selesai, fitur-fitur tambahan yang bisa dikembangkan:

1. **Advanced Analytics**
   - Predictive analytics untuk demand forecasting
   - Route optimization suggestions
   - Driver performance trends

2. **Notifications System**
   - Email notifications untuk events penting
   - In-app notifications
   - WhatsApp integration (optional)

3. **Route Management**
   - Visual route creator dengan map
   - Bus stop management
   - Schedule management

4. **Reporting**
   - Custom report builder
   - Automated daily/weekly/monthly reports
   - PDF export

5. **Mobile App** (Admin)
   - React Native app untuk monitoring on-the-go
   - Push notifications

---

## 📝 Notes

- **Timeline**: MVP bisa diselesaikan dalam **2-3 minggu** (1 developer full-time)
- **Maintenance**: Estimasi 4-8 jam per minggu untuk updates & bug fixes
- **Scalability**: Architecture mendukung scaling horizontal
- **Cost**: Supabase Free Tier cukup untuk start, Next.js di Vercel juga free tier

---

*Dokumentasi ini dibuat pada: 21 Januari 2026*  
*Author: Antigravity AI*  
*Version: 1.0*
