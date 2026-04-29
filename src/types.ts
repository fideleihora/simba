export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
}

export interface Store {
  name: string;
  tagline: string;
  location: string;
  currency: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionItem extends CartItem {}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  items: TransactionItem[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'failed' | 'completed';
  pickupBranch?: string;
  pickupTime?: string;
  depositPaid: number;
  assignedStaffId?: string;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export type UserRole = 'CEO' | 'branch_manager' | 'branch_staff' | 'customer';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  password?: string; // Only for local storage simulation
  role: UserRole;
  assignedBranchId?: string; // For branch managers
  noShowFlags?: number;
}

export interface BranchProduct {
  productId: number;
  branchId: string;
  stockLevel: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  rating?: number;
  totalReviews?: number;
}

export interface StoreData {
  store: Store;
  products: Product[];
}
