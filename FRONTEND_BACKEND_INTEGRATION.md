# Frontend-Backend Integration Guide

## 🔗 Connecting Frontend to Backend

### 1. Install Required Packages (Already Done)
The frontend already has:
- `@supabase/supabase-js` - Supabase client
- `axios` - HTTP requests
- `zustand` - State management

### 2. Create Supabase Client

[Frontend file needed: `src/lib/supabase.ts`]

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Environment Variables

Create `carmella/frontend/.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
```

### 4. Create API Service

[Frontend file needed: `src/lib/api.ts`]

```typescript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  google: (data) => api.post("/auth/google", data),
  me: () => api.get("/auth/me"),
};

export const productAPI = {
  list: (params) => api.get("/products", { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  requestB2B: (id, data) => api.post(`/users/${id}/request-b2b`, data),
  getB2BStatus: (id) => api.get(`/users/${id}/b2b-status`),
};

export const categoryAPI = {
  list: () => api.get("/categories"),
  get: (id) => api.get(`/categories/${id}`),
};

export const adminAPI = {
  getB2BRequests: (params) => api.get("/admin/b2b-requests", { params }),
  approveB2B: (id, data) => api.put(`/admin/b2b-requests/${id}/approve`, data),
  rejectB2B: (id, data) => api.put(`/admin/b2b-requests/${id}/reject`, data),
};
```

### 5. Authentication Context

Update [Context file: `src/contexts/AuthContext.tsx`]

```typescript
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { authAPI } from "../lib/api";

interface User {
  id: string;
  email: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await authAPI.me();
          setUser(response.data.profile);
        } catch (error) {
          localStorage.removeItem("access_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const response = await authAPI.signup({
      email,
      password,
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
    });
    localStorage.setItem("access_token", response.data.session.access_token);
    setUser(response.data.user);
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem("access_token", response.data.session.access_token);
    
    // Get user profile
    const meResponse = await authAPI.me();
    setUser(meResponse.data.profile);
  };

  const logout = async () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 6. Update Product Catalog Page

[Frontend file: `src/pages/Catalog.tsx`]

```typescript
import { useEffect, useState } from "react";
import { productAPI, categoryAPI } from "../lib/api";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    page: 1,
  });

  useEffect(() => {
    // Load categories
    categoryAPI.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    // Load products with filters
    productAPI.list(filters).then((res) => setProducts(res.data.products));
  }, [filters]);

  return (
    <div className="catalog">
      {/* Render products from API instead of mock data */}
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 7. Update Product Detail Page

[Frontend file: `src/pages/ProductDetail.tsx`]

```typescript
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productAPI } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (id) {
      productAPI.get(id).then((res) => setProduct(res.data));
    }
  }, [id]);

  return (
    <div>
      {product && (
        <>
          <h1>{product.name}</h1>
          <p>Price: ${product.price}</p>
          {/* ... rest of the UI */}
        </>
      )}
    </div>
  );
}
```

### 8. Connect Login/Signup Pages

[Frontend files: `src/pages/Login.tsx`, `src/pages/Signup.tsx`]

```typescript
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 9. B2B Status in Header

[Frontend file: `src/components/layout/header.tsx`]

```typescript
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../lib/api";

export function UserMenu() {
  const { user } = useAuth();
  const [b2bStatus, setB2bStatus] = useState(null);

  useEffect(() => {
    if (user?.id) {
      userAPI.getB2BStatus(user.id).then((res) => setB2bStatus(res.data));
    }
  }, [user]);

  return (
    <div>
      {user?.user_type === "b2b_pending" && (
        <div className="badge">B2B Approval Pending</div>
      )}
      {user?.user_type === "b2b_approved" && (
        <div className="badge">B2B Customer</div>
      )}
    </div>
  );
}
```

## 🔄 Data Flow

```
Frontend Signup
    ↓
Send to /api/auth/signup
    ↓
Backend creates user in Supabase Auth + DB
    ↓
Return { user, session }
    ↓
Frontend stores token, updates AuthContext
    ↓
Frontend ready to make authenticated requests

---

Frontend GET /products
    ↓
Backend queries DB (no auth required)
    ↓
Returns { products, pagination }
    ↓
Frontend displays products

---

Frontend request B2B access
    ↓
Send to /api/users/:id/request-b2b
    ↓
Backend creates b2b_approval record
    ↓
Admin approves from /api/admin/b2b-requests/:id/approve
    ↓
Backend updates user_type to "b2b_approved"
    ↓
Frontend shows B2B status change
```

## 🧪 Testing with Postman/Thunder Client

### Test Login Flow
1. **POST** `/api/auth/signup` with credentials
2. Copy `session.access_token` from response
3. **GET** `/api/auth/me` with token in Authorization header
4. Should return user profile

### Test Products
1. **GET** `/api/products` - No auth needed
2. **GET** `/api/products?category=bowls` - Filter by category
3. **GET** `/api/products/:id` - Get single product

### Test Protected Routes
1. Get token from login
2. Add header: `Authorization: Bearer {token}`
3. Try **PUT** `/api/users/{id}` with profile data
4. Should work if token is valid

## 🚀 Deployment Checklist

- [ ] Set production Supabase credentials
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Enable HTTPS for all API calls
- [ ] Test all auth flows
- [ ] Test all CRUD operations
- [ ] Verify error handling
- [ ] Check CORS headers
- [ ] Monitor API logs
