import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, CalendarIcon, TrendingUp, HelpCircle, Info, Activity, PieChart, AreaChart as AreaChartIcon, Layers, Package, TrendingDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, PolarGrid, PolarAngleAxis, Radar, RadarChart, LineChart, Line, AreaChart, Area, PieChart as ReChartPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';

// Define types for our analytics data
interface ProductAnalytic {
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

interface Product {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  reorder_level: number;
  price: number;
  analytics: ProductAnalytic[];
}

interface AnalyticsSummary {
  total_products: number;
  total_stock_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  top_selling_products: {
    product_id: number;
    product_name: string;
    total_sold: number;
  }[];
  stock_movement_summary: {
    date: string;
    stock_in: number;
    stock_out: number;
  }[];
}

interface AnalyticsPageProps {
  auth: {
    user: User;
  };
  products: Product[];
  summary: AnalyticsSummary;
  date_range: {
    start: string;
    end: string;
  };
}

export default function AnalyticsIndex({ auth, products, summary, date_range }: AnalyticsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: date_range.start ? new Date(date_range.start) : subDays(new Date(), 15),
    to: date_range.end ? new Date(date_range.end) : new Date(),
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  return (
    <AppLayout user={auth.user}>
      <Head title="Inventory Analytics" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Inventory Analytics</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range) {
                          setDateRange(range);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bento Grid Dashboard */}
          <div className="grid grid-cols-4 grid-rows-5 gap-6 auto-rows-fr mb-8">
            {/* Summary Metrics - Row 1, Col 1 */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>Total Products</span>
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                      <span className="sr-only">Info</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="top">
                    <div className="space-y-2">
                      <h4 className="font-medium">Total Products</h4>
                      <p className="text-sm text-muted-foreground">The total number of distinct product items in your inventory catalog, regardless of stock level.</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="pt-2 pb-3 flex-1 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold">{summary.total_products}</div>
                <p className="text-xs text-muted-foreground mt-1">active products</p>
              </CardContent>
            </Card>
            
            {/* Stock Value - Row 1, Col 2 */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Stock Value</span>
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                      <span className="sr-only">Info</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="top">
                    <div className="space-y-2">
                      <h4 className="font-medium">Total Stock Value</h4>
                      <p className="text-sm text-muted-foreground">The combined monetary value of all products in your current inventory, calculated as (quantity × price) for each product.</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="pt-2 pb-3 flex-1 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold">${summary.total_stock_value.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">total value</p>
              </CardContent>
            </Card>
            
            {/* Low Stock - Row 1, Col 3 */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>Low Stock</span>
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                      <span className="sr-only">Info</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="top">
                    <div className="space-y-2">
                      <h4 className="font-medium">Low Stock Items</h4>
                      <p className="text-sm text-muted-foreground">Products with stock levels below their reorder threshold. These items may need restocking soon.</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="pt-2 pb-3 flex-1 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold text-amber-500">{summary.low_stock_count}</div>
                <p className="text-xs text-muted-foreground mt-1">below reorder level</p>
              </CardContent>
            </Card>
            
            {/* Out of Stock - Row 1, Col 4 */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Out of Stock</span>
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                      <span className="sr-only">Info</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="top">
                    <div className="space-y-2">
                      <h4 className="font-medium">Out of Stock</h4>
                      <p className="text-sm text-muted-foreground">Products with zero inventory available. These items cannot be fulfilled if ordered.</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="pt-2 pb-3 flex-1 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold text-red-500">{summary.out_of_stock_count}</div>
                <p className="text-xs text-muted-foreground mt-1">items unavailable</p>
              </CardContent>
            </Card>
            
            {/* Stock Movement Trend - Row 2-3, Col 1-2 (Spanning 2 rows, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-2 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Stock Movement Trend</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Stock Movement Trend</h4>
                        <p className="text-sm text-muted-foreground">
                          This bar chart shows inventory flow over time:
                        </p>
                        <div className="pt-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="text-xs">Stock In: New inventory received</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="text-xs">Stock Out: Inventory sold or removed</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Stock in vs stock out over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      stock_in: {
                        label: "Stock In",
                        color: "#22c55e" // green-500
                      },
                      stock_out: {
                        label: "Stock Out",
                        color: "#ef4444" // red-500
                      }
                    }}
                    className="h-[300px] w-full"
                  >
                    <BarChart 
                      data={summary.stock_movement_summary.slice(-10)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      barGap={0}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          return new Date(value).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          });
                        }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              });
                            }}
                          />
                        }
                      />
                      <Bar 
                        dataKey="stock_in" 
                        fill="var(--color-stock_in)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="stock_out" 
                        fill="var(--color-stock_out)"
                        radius={[4, 4, 0, 0]}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Selling Products - Row 2-3, Col 3-4 (Spanning 2 rows, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-2 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Top Selling Products</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Top Selling Products</h4>
                        <p className="text-sm text-muted-foreground">
                          This chart shows your best-selling products ranked by total units sold. 
                          The bar length represents relative sales performance compared to your top seller.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Products with highest turnover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.top_selling_products.map((product, index) => {
                    // Calculate percentage for bar width
                    const maxSold = Math.max(...summary.top_selling_products.map(p => p.total_sold));
                    const percentage = maxSold > 0 ? (product.total_sold / maxSold) * 100 : 0;
                    
                    return (
                      <div key={product.product_id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <span className="font-medium">{product.product_name}</span>
                          </div>
                          <span>{product.total_sold} units</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Category Distribution - Row 4, Col 1-2 (Spanning 1 row, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Category Distribution</h4>
                        <p className="text-sm text-muted-foreground">
                          This pie chart shows how your inventory is distributed across different product categories.
                          Hover over segments to see detailed information.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Inventory breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartPieChart>
                      <Pie
                        data={[
                          { name: 'Electronics', value: 35, fill: '#8884d8' },
                          { name: 'Clothing', value: 25, fill: '#82ca9d' },
                          { name: 'Home Goods', value: 20, fill: '#ffc658' },
                          { name: 'Books', value: 15, fill: '#ff8042' },
                          { name: 'Other', value: 5, fill: '#0088fe' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                    </ReChartPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Inventory Value Trend - Row 4, Col 3-4 (Spanning 1 row, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Inventory Value Trend</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Inventory Value Trend</h4>
                        <p className="text-sm text-muted-foreground">
                          This line chart shows the estimated total monetary value of your inventory over time.
                          It's calculated from stock movements and helps track your capital investment in inventory.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Total inventory value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Inventory Value",
                        color: "#0ea5e9" // sky-500
                      }
                    }}
                    className="h-[200px] w-full"
                  >
                    <AreaChart
                      data={summary.stock_movement_summary.map((item, index) => {
                        // Simulate inventory value based on stock movements
                        // will be refactored to be requested from backend
                        const baseValue = 50000;
                        const cumulativeChange = summary.stock_movement_summary
                          .slice(0, index + 1)
                          .reduce((acc, curr) => {
                            return acc + ((curr.stock_in - curr.stock_out) * 100); // avg product value of $100
                          }, 0);
                        
                        return {
                          date: item.date,
                          value: baseValue + cumulativeChange
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          return new Date(value).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          });
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              });
                            }}
                            formatter={(value) => `$${value.toLocaleString()}`}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Radar - Row 5, Col 1-2 (Spanning 1 row, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Product Performance Radar</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Inventory Performance Radar</h4>
                        <p className="text-sm text-muted-foreground">
                          This radar chart compares three key metrics across your top products:
                        </p>
                        <div className="pt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }}></div>
                            <span className="text-xs">Sales: Total units sold</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }}></div>
                            <span className="text-xs">Stock: Current inventory level</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#8b5cf6' }}></div>
                            <span className="text-xs">Turnover: How quickly items sell</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Multi-metric product comparison</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.top_selling_products.length > 0 && (
                  <div className="h-[200px]">
                    <ChartContainer
                      config={{
                        sales: {
                          label: "Sales",
                          color: "#f97316" // orange-500
                        },
                        stock: {
                          label: "Stock",
                          color: "#06b6d4" // cyan-500
                        },
                        turnover: {
                          label: "Turnover",
                          color: "#8b5cf6" // violet-500
                        }
                      }}
                      className="h-[200px] w-full mx-auto"
                    >
                      <RadarChart 
                        data={summary.top_selling_products.slice(0, 5).map(product => ({
                          name: product.product_name,
                          sales: product.total_sold,

                          // Simulate values for visualization purposes
                          // will be replaced with actual values from backend
                          stock: Math.round(product.total_sold * 0.8),
                          turnover: Math.round(product.total_sold * 0.5)
                        }))}
                        outerRadius={90}
                        width={500}
                        height={200}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <Radar 
                          name="Sales" 
                          dataKey="sales" 
                          fill="var(--color-sales)" 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Stock" 
                          dataKey="stock" 
                          fill="var(--color-stock)" 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Turnover" 
                          dataKey="turnover" 
                          fill="var(--color-turnover)" 
                          fillOpacity={0.6} 
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RadarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Stock Health Analysis - Row 5, Col 3-4 (Spanning 1 row, 2 columns) */}
            <Card className="shadow-sm hover:shadow transition-shadow duration-200 row-span-1 col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Stock Health Analysis</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top">
                      <div className="space-y-2">
                        <h4 className="font-medium">Stock Health Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          This scatter plot shows the relationship between stock levels and sales velocity.
                          Ideal products have balanced stock relative to their sales rate.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription>Stock level vs. sales velocity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="stock" 
                        name="Stock Level" 
                        axisLine={false}
                        tickLine={false}
                        unit=" units"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="sales" 
                        name="Sales Velocity" 
                        axisLine={false}
                        tickLine={false}
                        unit=" units/day"
                      />
                      <ZAxis type="number" range={[60, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      <Scatter 
                        name="Product Stock Health" 
                        data={summary.top_selling_products.map(product => ({
                          name: product.product_name,
                          stock: Math.round(product.total_sold * 0.8), // Simulated stock value
                          sales: (product.total_sold / 30).toFixed(1), // Simulated daily sales velocity
                          z: product.total_sold  // Size relates to total sales
                        }))}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList className="mb-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stock-movement">Stock Movement</TabsTrigger>
                <TabsTrigger value="product-performance">Product Performance</TabsTrigger>
              </TabsList>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 hover:bg-muted">
                    <Info className="h-4 w-4" />
                    <span>Metrics Guide</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] max-h-[85vh] overflow-y-auto" align="end">
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-medium text-lg border-b pb-2">Inventory Analytics Guide</h3>
                      <p className="text-sm text-muted-foreground mt-2">This guide explains the key metrics and visualizations used in the inventory analytics dashboard.</p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="font-medium text-primary">Chart Types</h4>
                      <div className="pl-2 border-l-2 border-primary/20 space-y-3 pt-1">
                        <div>
                          <h5 className="font-medium">Bar Chart</h5>
                          <p className="text-sm text-muted-foreground">Shows comparisons between categories. In this dashboard, we use bar charts to compare stock movement (in vs out) over time.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Radar Chart</h5>
                          <p className="text-sm text-muted-foreground">Displays multivariate data across several quantitative variables. We use this to compare multiple metrics (sales, stock, turnover) across top products.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Line Chart</h5>
                          <p className="text-sm text-muted-foreground">Shows trends over time. Used to visualize inventory value fluctuations across your selected date range.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="font-medium text-primary">Key Metrics</h4>
                      <div className="pl-2 border-l-2 border-primary/20 space-y-3 pt-1">
                        <div>
                          <h5 className="font-medium">Stock Movement</h5>
                          <p className="text-sm text-muted-foreground">Tracks inventory coming in (green) and going out (red) of your warehouse over time. Helps identify trends and seasonality in inventory flow.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Product Performance</h5>
                          <p className="text-sm text-muted-foreground">Shows which products are selling best and their inventory metrics like turnover rate and current stock levels. Helps identify star products and potential issues.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Turnover Rate</h5>
                          <p className="text-sm text-muted-foreground">How quickly inventory is sold and replaced over a period. Calculated as (Sales / Average Inventory). Higher values indicate faster-moving products that may need more frequent reordering.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Inventory Value</h5>
                          <p className="text-sm text-muted-foreground">The total monetary worth of your current inventory, calculated as quantity × unit price for each product. Helps track capital tied up in inventory.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Low Stock & Out of Stock</h5>
                          <p className="text-sm text-muted-foreground">Products that are below reorder level or completely unavailable. These metrics help prioritize restocking efforts to prevent stockouts.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Hover over any chart's help icon <span className="inline-block"><HelpCircle className="h-3 w-3 inline" /></span> for specific information about that visualization.
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Stock Movement Trend</CardTitle>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top">
                          <div className="space-y-2">
                            <h4 className="font-medium">Stock Movement Trend</h4>
                            <p className="text-sm text-muted-foreground">
                              This bar chart shows inventory flow over time:
                            </p>
                            <div className="pt-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                <span className="text-xs">Stock In: New inventory received</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                <span className="text-xs">Stock Out: Inventory sold or removed</span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <CardDescription>Stock in vs stock out over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          stock_in: {
                            label: "Stock In",
                            color: "#22c55e" // green-500
                          },
                          stock_out: {
                            label: "Stock Out",
                            color: "#ef4444" // red-500
                          }
                        }}
                        className="h-[300px] w-full"
                      >
                        <BarChart 
                          data={summary.stock_movement_summary.slice(-10)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                          barGap={0}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                              return new Date(value).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              });
                            }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  return new Date(value).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  });
                                }}
                              />
                            }
                          />
                          <Bar 
                            dataKey="stock_in" 
                            fill="var(--color-stock_in)"
                            radius={[4, 4, 0, 0]}
                            label={{
                              position: 'top',
                              formatter: (value: number) => value || '',
                              fill: '#22c55e',
                              fontSize: 12
                            }}
                          />
                          <Bar 
                            dataKey="stock_out" 
                            fill="var(--color-stock_out)"
                            radius={[4, 4, 0, 0]}
                            label={{
                              position: 'top',
                              formatter: (value: number) => value || '',
                              fill: '#ef4444',
                              fontSize: 12
                            }}
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Top Selling Products</CardTitle>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" side="top">
                            <div className="space-y-2">
                              <h4 className="font-medium">Top Selling Products</h4>
                              <p className="text-sm text-muted-foreground">
                                This chart shows your best-selling products ranked by total units sold. 
                                The bar length represents relative sales performance compared to your top seller.
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <CardDescription>Products with highest turnover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {summary.top_selling_products.map((product, index) => {
                          // Calculate percentage for bar width
                          const maxSold = Math.max(...summary.top_selling_products.map(p => p.total_sold));
                          const percentage = maxSold > 0 ? (product.total_sold / maxSold) * 100 : 0;
                          
                          return (
                            <div key={product.product_id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium">{product.product_name}</span>
                                </div>
                                <span>{product.total_sold} units</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary rounded-full h-2" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Inventory Metrics</CardTitle>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" side="top">
                            <div className="space-y-2">
                              <h4 className="font-medium">Inventory Performance Radar</h4>
                              <p className="text-sm text-muted-foreground">
                                This radar chart compares three key metrics across your top products:
                              </p>
                              <div className="pt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }}></div>
                                  <span className="text-xs">Sales: Total units sold</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }}></div>
                                  <span className="text-xs">Stock: Current inventory level</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#8b5cf6' }}></div>
                                  <span className="text-xs">Turnover: How quickly items sell</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <CardDescription>Product inventory performance radar</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {summary.top_selling_products.length > 0 && (
                        <>
                          <ChartContainer
                            config={{
                              sales: {
                                label: "Sales",
                                color: "#f97316" // orange-500
                              },
                              stock: {
                                label: "Stock",
                                color: "#06b6d4" // cyan-500
                              },
                              turnover: {
                                label: "Turnover",
                                color: "#8b5cf6" // violet-500
                              }
                            }}
                            className="aspect-square h-[240px] mx-auto"
                          >
                            <RadarChart 
                              data={summary.top_selling_products.slice(0, 5).map(product => ({
                                name: product.product_name,
                                sales: product.total_sold,
                                // Simulate values for visualization purposes
                                stock: Math.round(product.total_sold * 0.8),
                                turnover: Math.round(product.total_sold * 0.5)
                              }))}
                            >
                              <PolarGrid />
                              <PolarAngleAxis dataKey="name" />
                              <Radar 
                                name="Sales" 
                                dataKey="sales" 
                                fill="var(--color-sales)" 
                                fillOpacity={0.6} 
                              />
                              <Radar 
                                name="Stock" 
                                dataKey="stock" 
                                fill="var(--color-stock)" 
                                fillOpacity={0.6} 
                              />
                              <Radar 
                                name="Turnover" 
                                dataKey="turnover" 
                                fill="var(--color-turnover)" 
                                fillOpacity={0.6} 
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <ChartLegend content={<ChartLegendContent />} />
                            </RadarChart>
                          </ChartContainer>
                          <div className="flex justify-center items-center gap-2 text-sm mt-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Top 5 products metrics comparison</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stock-movement">
              <div className="grid gap-4 mb-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Inventory Value Trend</CardTitle>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top">
                          <div className="space-y-2">
                            <h4 className="font-medium">Inventory Value Trend</h4>
                            <p className="text-sm text-muted-foreground">
                              This line chart shows the estimated total monetary value of your inventory over time.
                              It's calculated from stock movements and helps track your capital investment in inventory.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <CardDescription>Total inventory value over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          value: {
                            label: "Inventory Value",
                            color: "#0ea5e9" // sky-500
                          }
                        }}
                        className="h-[300px] w-full"
                      >
                        <LineChart 
                          data={summary.stock_movement_summary.map((item, index) => ({
                            date: item.date,
                            value: item.stock_in - item.stock_out + (index > 0 ? index * 100 : 500) // Simulated cumulative inventory value
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                              return new Date(value).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              });
                            }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  return new Date(value).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  });
                                }}
                                formatter={(value) => `$${value}`}
                              />
                            }
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Movement History</CardTitle>
                    <CardDescription>Detailed view of stock ins and outs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Date</th>
                              <th className="text-right p-2">Stock In</th>
                              <th className="text-right p-2">Stock Out</th>
                              <th className="text-right p-2">Net Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.stock_movement_summary.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-muted/50">
                                <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="text-right p-2 text-green-600">{item.stock_in}</td>
                                <td className="text-right p-2 text-red-600">{item.stock_out}</td>
                                <td className="text-right p-2 font-medium">{item.stock_in - item.stock_out}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="product-performance">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Performance Analysis</CardTitle>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" side="top">
                        <div className="space-y-2">
                          <h4 className="font-medium">Product Performance</h4>
                          <p className="text-sm text-muted-foreground">
                            This analysis shows how efficiently your products are performing in terms of stock levels and inventory management.
                            Products with stock issues are highlighted to help prioritize your inventory actions.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <CardDescription>Turnover rates and stock efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[450px] overflow-auto px-1 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Low Stock Products</h3>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72" side="top">
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  Products with stock below their reorder level. The progress bar indicates current stock as a percentage of the reorder threshold.
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-5">
                          {products
                            .filter(p => p.current_stock > 0 && p.current_stock < p.reorder_level)
                            .slice(0, 5)
                            .map(product => {
                              const percentage = (product.current_stock / product.reorder_level) * 100;
                              return (
                                <div key={product.id} className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{product.name}</span>
                                    <span>{product.current_stock}/{product.reorder_level}</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className={`rounded-full h-2 ${percentage < 30 ? 'bg-red-500' : 'bg-amber-500'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium">Out of Stock Products</h3>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72" side="top">
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  Products with zero inventory that need immediate attention. These items cannot be fulfilled if ordered and represent potential lost sales.
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-5">
                          {products
                            .filter(p => p.current_stock === 0)
                            .slice(0, 5)
                            .map(product => (
                              <div key={product.id} className="flex justify-between items-center p-3 border border-red-200 bg-red-50/50 rounded-md shadow-sm">
                                <span className="font-medium">{product.name}</span>
                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">Out of Stock</span>
                              </div>
                            ))}
                            {products.filter(p => p.current_stock === 0).length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                No out of stock products - great inventory management!
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
