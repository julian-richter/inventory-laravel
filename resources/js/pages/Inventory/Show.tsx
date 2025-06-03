import React from 'react';
import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Pencil, TrendingUp, History } from 'lucide-react';
import { format } from 'date-fns';

interface StockMovement {
  id: number;
  product_id: number;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reference: string;
  notes: string | null;
  stock_before: number;
  stock_after: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface ProductAnalytic {
  id: number;
  product_id: number;
  date: string;
  stock_added: number;
  stock_removed: number;
  days_to_restock: number | null;
  times_out_of_stock: number;
  days_out_of_stock: number;
  turnover_rate: number;
  created_at: string;
  updated_at: string;
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
  stock_movements: StockMovement[];
  analytics: ProductAnalytic[];
}

interface ProductShowProps {
  auth: {
    user: User;
  };
  product: Product;
}

export default function ProductShow({ auth, product }: ProductShowProps) {
  const getStockStatusBadge = () => {
    if (product.current_stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.current_stock < product.reorder_level) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    if (type === 'in') {
      return <Badge variant="default">Stock In</Badge>;
    } else if (type === 'out') {
      return <Badge variant="destructive">Stock Out</Badge>;
    } else {
      return <Badge variant="secondary">Adjustment</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <AppLayout user={auth.user}>
      <Head title={`Product: ${product.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h2 className="text-2xl font-semibold text-gray-900 flex-1">{product.name}</h2>
            <Link href={route('inventory.edit', product.id)}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">SKU:</dt>
                    <dd className="text-sm text-gray-900">{product.sku}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Price:</dt>
                    <dd className="text-sm text-gray-900">${product.price.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Category:</dt>
                    <dd className="text-sm text-gray-900">{product.category || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status:</dt>
                    <dd className="text-sm text-gray-900">{product.active ? 'Active' : 'Inactive'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Stock Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Current Stock:</dt>
                    <dd className="text-sm text-gray-900">{product.current_stock}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Reorder Level:</dt>
                    <dd className="text-sm text-gray-900">{product.reorder_level}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Stock Status:</dt>
                    <dd className="text-sm text-gray-900">{getStockStatusBadge()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Stock Value:</dt>
                    <dd className="text-sm text-gray-900">
                      ${(product.current_stock * product.price).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Supplier:</dt>
                    <dd className="text-sm text-gray-900">{product.supplier || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Location:</dt>
                    <dd className="text-sm text-gray-900">{product.location || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Created:</dt>
                    <dd className="text-sm text-gray-900">{formatDate(product.created_at)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Last Updated:</dt>
                    <dd className="text-sm text-gray-900">{formatDate(product.updated_at)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {product.description && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{product.description}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="stock-movements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock-movements" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Stock Movements
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stock-movements">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Stock Movements</CardTitle>
                  <CardDescription>
                    History of stock changes for this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.stock_movements.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No stock movements</h3>
                      <p className="text-sm text-gray-500">
                        This product has no recorded stock movements yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Stock Before</TableHead>
                            <TableHead>Stock After</TableHead>
                            <TableHead>User</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.stock_movements.map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell>{formatDate(movement.created_at)}</TableCell>
                              <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                              <TableCell>
                                {movement.type === 'out' ? movement.quantity * -1 : movement.quantity}
                              </TableCell>
                              <TableCell>{movement.reference || '-'}</TableCell>
                              <TableCell>{movement.stock_before}</TableCell>
                              <TableCell>{movement.stock_after}</TableCell>
                              <TableCell>{movement.user?.name || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="mt-4">
                    <Link href={route('inventory.movements.create')}>
                      <Button>Add Stock Movement</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Product Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics for this product over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.analytics.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No analytics data</h3>
                      <p className="text-sm text-gray-500">
                        This product has no recorded analytics data yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Stock Added</TableHead>
                            <TableHead>Stock Removed</TableHead>
                            <TableHead>Days to Restock</TableHead>
                            <TableHead>Times Out of Stock</TableHead>
                            <TableHead>Turnover Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.analytics.map((analytic) => (
                            <TableRow key={analytic.id}>
                              <TableCell>{format(new Date(analytic.date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{analytic.stock_added}</TableCell>
                              <TableCell>{analytic.stock_removed}</TableCell>
                              <TableCell>{analytic.days_to_restock || '-'}</TableCell>
                              <TableCell>{analytic.times_out_of_stock}</TableCell>
                              <TableCell>{analytic.turnover_rate.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
