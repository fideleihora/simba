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
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  password?: string; // Only for local storage simulation
}

export interface StoreData {
  store: Store;
  products: Product[];
}
