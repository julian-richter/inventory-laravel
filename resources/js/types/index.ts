export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PageProps {
  auth: {
    user: User;
  };
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Paginated<T> {
  data: T[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  breadcrumbs?: BreadcrumbItem[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  current_stock: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reference: string | null;
  notes: string | null;
  stock_before: number;
  stock_after: number;
  user_id: number | null;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ProductAnalytic {
  id: number;
  product_id: number;
  date: string;
  stock_added: number;
  stock_removed: number;
  days_to_restock: number;
  times_out_of_stock: number;
  days_out_of_stock: number;
  turnover_rate: number;
  stock_value: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: PaginationLink[];
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ProductWithRelations extends Product {
  stock_movements: StockMovement[];
  analytics: ProductAnalytic[];
}
