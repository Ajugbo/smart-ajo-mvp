export type UserRole = 'master_admin' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  admin_id: string;
  invite_code: string;
  base_contribution: number;
  max_participants: number;
  target_multiplier: number;
  status: 'active' | 'completed' | 'pending';
}

export interface Membership {
  id: string;
  user_id: string;
  group_id: string;
  role: 'admin' | 'member';
}
