import React from 'react';
import { Head } from '@inertiajs/react';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useForm as useReactHookForm } from 'react-hook-form';
import type { PageProps } from '@inertiajs/core';
import { User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

interface CreateProductProps {
  auth: {
    user: User;
  };
  categories: string[];
}

export default function CreateProduct({ auth, categories }: CreateProductProps) {
  // Inertia form for handling submission to the server
  const { data, setData, post, processing, errors } = useInertiaForm({
    name: '',
    sku: '',
    description: '',
    price: '',
    current_stock: '0',
    reorder_level: '5',
    category: '',
    supplier: '',
    location: '',
    image_path: '',
    active: true,
  });

  // React Hook Form for shadcn/ui Form components
  const form = useReactHookForm({
    defaultValues: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: data.price,
      current_stock: data.current_stock,
      reorder_level: data.reorder_level,
      category: data.category,
      supplier: data.supplier,
      location: data.location,
      active: data.active,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('inventory.store'));
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Add Product" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h2 className="text-2xl font-semibold text-gray-900">Add New Product</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Enter the details for the new product you want to add to your inventory.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <Form {...form}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </FormControl>
                      {errors.name && <FormMessage>{errors.name}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit) *</FormLabel>
                      <FormControl>
                        <Input
                          value={data.sku}
                          onChange={(e) => setData('sku', e.target.value)}
                          placeholder="Enter unique SKU"
                          required
                        />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this product
                      </FormDescription>
                      {errors.sku && <FormMessage>{errors.sku}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.price}
                          onChange={(e) => setData('price', e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </FormControl>
                      {errors.price && <FormMessage>{errors.price}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          value={data.category}
                          onValueChange={(value) => setData('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {errors.category && <FormMessage>{errors.category}</FormMessage>}
                    </FormItem>
                  </div>

                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Initial Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={data.current_stock}
                          onChange={(e) => setData('current_stock', e.target.value)}
                          required
                        />
                      </FormControl>
                      {errors.current_stock && <FormMessage>{errors.current_stock}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>Reorder Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={data.reorder_level}
                          onChange={(e) => setData('reorder_level', e.target.value)}
                          required
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum stock level before reordering
                      </FormDescription>
                      {errors.reorder_level && <FormMessage>{errors.reorder_level}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input
                          value={data.supplier}
                          onChange={(e) => setData('supplier', e.target.value)}
                          placeholder="Enter supplier name"
                        />
                      </FormControl>
                      {errors.supplier && <FormMessage>{errors.supplier}</FormMessage>}
                    </FormItem>

                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          value={data.location}
                          onChange={(e) => setData('location', e.target.value)}
                          placeholder="Enter storage location"
                        />
                      </FormControl>
                      {errors.location && <FormMessage>{errors.location}</FormMessage>}
                    </FormItem>
                  </div>
                </div>

                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </FormControl>
                  {errors.description && <FormMessage>{errors.description}</FormMessage>}
                </FormItem>

                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={data.active}
                      onCheckedChange={(checked) => setData('active', checked as any)}
                    />
                    <FormLabel htmlFor="active" className="cursor-pointer">
                      Active
                    </FormLabel>
                  </div>
                  <FormDescription>
                    Inactive products won't appear in your inventory list
                  </FormDescription>
                </FormItem>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  Create Product
                </Button>
              </CardFooter>
              </Form>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
