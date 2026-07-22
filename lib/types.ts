// Domain types for the Contribution Circle platform.

export type GroupStatus = 'pending' | 'active' | 'completed';
export type WalletKind = 'group' | 'master_anchor' | 'platform_revenue';
export type TxnDirection = 'debit' | 'credit';
export type CashoutMode = 'standard' | 'full_anchor';
export type QueueStatus = 'queued' | 'cashed_out';
export type MembershipRole = 'admin' | 'member';
export type UserRole = 'master_admin' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: UserRole;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  admin_id: string;
  base_contribution: number;
  target_multiplier: number;
  min_participants: number;
  max_participants: number;
  invite_code: string;
  status: GroupStatus;
  created_at: string;
}

export interface Membership {
  id: string;
  group_id: string;
  user_id: string;
  role: MembershipRole;
  joined_at: string;
}

export interface GroupWallet {
  id: string;
  group_id: string;
  balance: number;
}

export type LoyaltyTier = 'STANDARD' | 'SPEED' | 'TURBO' | 'ELITE';

export interface AnchorBalance {
  id: string;
  group_id: string;
  user_id: string;
  locked_amount: number;
  cycle_count: number;
  cumulative_interest: number;
  loyalty_tier: LoyaltyTier;
  interest_last_accrued_at?: string | null;
}

export interface QueuePosition {
  id: string;
  group_id: string;
  user_id: string;
  position: number;
  units_paid: number;
  units_target: number;
  status: QueueStatus;
  created_at: string;
}

export interface Contribution {
  id: string;
  group_id: string;
  user_id: string;
  units: number;
  amount: number;
  reference: string;
  created_at: string;
}

export interface Cashout {
  id: string;
  group_id: string;
  user_id: string;
  cycle_number: number;
  gross_amount: number;
  anchor_deducted: number;
  anchor_pulled_from_balance: number;
  net_paid: number;
  mode: CashoutMode;
  created_at: string;
}

export interface Transaction {
  id: string;
  group_id: string | null;
  user_id: string | null;
  wallet_kind: WalletKind;
  wallet_ref: string;
  direction: TxnDirection;
  amount: number;
  reason: string;
  ref_id: string | null;
  created_at: string;
}

export interface QueueEntry extends QueuePosition {
  user: Pick<User, 'id' | 'name' | 'phone'>;
  loyalty_tier?: LoyaltyTier;
}

export interface LoyaltyInfo {
  tier: LoyaltyTier;
  anchor_principal: number;
  cumulative_interest: number;
  cycle_count: number;
  discount: number;
  instant_fee: number | null;
  can_instant_cashout: boolean;
  can_claim_dividend: boolean;
  next_tier: LoyaltyTier | null;
  next_tier_anchor_required: number;
  next_tier_interest_required: number;
  anchor_progress_pct: number;
  interest_progress_pct: number;
}

export interface GroupDetail extends Group {
  wallet_balance: number;
  member_count: number;
  my_position?: number;
  my_units_paid?: number;
  my_units_target?: number;
  my_anchor_balance?: number;
  my_cycle_count?: number;
  my_queue_status?: QueueStatus;
  my_cumulative_interest?: number;
  my_loyalty_tier?: LoyaltyTier;
}

export interface AddContributionResult {
  contribution_id: string;
  new_position: number;
  units_paid: number;
  units_target: number;
  wallet_balance: number;
}

export interface RequestCashoutResult {
  cashout_id: string;
  cycle_number: number;
  gross_amount: number;
  anchor_deducted: number;
  anchor_pulled_from_balance: number;
  net_paid: number;
  mode: CashoutMode;
  new_anchor_balance: number;
  new_wallet_balance: number;
}

export interface AccrueYieldResult {
  accrued: number;
  new_master_balance: number;
  new_revenue_balance: number;
}