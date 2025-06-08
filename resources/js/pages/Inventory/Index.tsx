import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus, Trash2, ArrowUpDown, Package } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Define interfaces directly
interface LaravelPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Paginated<T> {
  data: T[];
  links: LaravelPaginationLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  current_stock: number;
  reorder_level: number;
  category: string | null;
  supplier: string | null;
  location: string | null;
  image_path: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  stock_movements?: {
    id: number;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    created_at: string;
  }[];
}

interface InventoryIndexProps {
  auth: { user: User };
  products: Paginated<Product>;
  categories: string[];
  filters: {
    search?: string;
    category?: string;
    stock_status?: string;
  };
}

export default function InventoryIndex({ auth, products, categories, filters }: InventoryIndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');
  const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('inventory.index'), { search, category, stock_status: stockStatus }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      router.delete(route('inventory.destroy', id));
    }
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.current_stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.current_stock < product.reorder_level) {
      return <Badge className="bg-yellow-500">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500">In Stock</Badge>;
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Inventory" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold dark:text-white-900">Inventory</h2>
            <Link href={route('inventory.create')}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your inventory products, track stock levels, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, SKU, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={stockStatus} onValueChange={setStockStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Filter</Button>
              </form>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Price
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Stock
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400 mb-2" />
                            <h3 className="text-lg font-medium">No products found</h3>
                            <p className="text-sm text-gray-500">
                              Try adjusting your search or filter to find what you're looking for.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.data.map((product: Product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.sku}</TableCell>
                          <TableCell>
                            <Link
                              href={route('inventory.show', product.id)}
                              className="text-blue-600 hover:underline"
                            >
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.current_stock} / {product.reorder_level}
                          </TableCell>
                          <TableCell>{getStockStatusBadge(product)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={route('inventory.edit', product.id)}>
                                <Button variant="outline" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {products.links && products.links.length > 3 && (
                <div className="mt-4">
                  <Pagination className="mt-4">
                    <PaginationContent>
                      {products.links.map((link, i: number) => {
                        // Skip prev/next links as we'll add them separately
                        if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') {
                          return null;
                        }
                        
                        // For the first item, add a Previous link if available
                        if (i === 1) {
                          const prevLink = products.links.find(l => l.label === '&laquo; Previous');
                          if (prevLink && prevLink.url) {
                            return (
                              <React.Fragment key="prev">
                                <PaginationItem>
                                  <PaginationPrevious 
                                    href="#" 
                                    onClick={(e: React.MouseEvent) => {
                                      e.preventDefault();
                                      router.visit(prevLink.url || '');
                                    }}
                                  />
                                </PaginationItem>
                                <PaginationItem key={link.label}>
                                  <PaginationLink 
                                    href="#" 
                                    isActive={link.active}
                                    onClick={(e: React.MouseEvent) => {
                                      e.preventDefault();
                                      if (link.url) router.visit(link.url);
                                    }}
                                  >
                                    {link.label}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }
                        }
                        
                        // For the last numeric item, add a Next link if available
                        if (i === products.links.length - 2) {
                          const nextLink = products.links.find(l => l.label === 'Next &raquo;');
                          return (
                            <React.Fragment key={link.label}>
                              <PaginationItem>
                                <PaginationLink 
                                  href="#" 
                                  isActive={link.active}
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (link.url) router.visit(link.url);
                                  }}
                                >
                                  {link.label}
                                </PaginationLink>
                              </PaginationItem>
                              {nextLink && nextLink.url && (
                                <PaginationItem key="next">
                                  <PaginationNext 
                                    href="#" 
                                    onClick={(e: React.MouseEvent) => {
                                      e.preventDefault();
                                      router.visit(nextLink.url || '');
                                    }}
                                  />
                                </PaginationItem>
                              )}
                            </React.Fragment>
                          );
                        }
                        
                        // Regular page links
                        return (
                          <PaginationItem key={link.label}>
                            <PaginationLink 
                              href="#" 
                              isActive={link.active}
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                if (link.url) router.visit(link.url);
                              }}
                            >
                              {link.label}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
