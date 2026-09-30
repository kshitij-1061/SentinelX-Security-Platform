export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role: {
    id: string;
    name: string;
    description?: string;
    permissions: Array<{ id: string; name: string; description?: string }>;
  };
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface SystemHealth {
  status: string;
  database: string;
  service: string;
  version: string;
}
