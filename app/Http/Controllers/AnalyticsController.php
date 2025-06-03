<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductAnalytic;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function index(Request $request)
    {
        // Get date range for analytics (default to last 30 days)
        $endDate = Carbon::today();
        $startDate = Carbon::today()->subDays(29); // 30 days including today
        
        if ($request->has('date_range')) {
            $range = $request->input('date_range');
            if ($range === 'week') {
                $startDate = Carbon::today()->subDays(6); // 7 days including today
            } elseif ($range === 'month') {
                $startDate = Carbon::today()->subDays(29); // 30 days including today
            } elseif ($range === 'quarter') {
                $startDate = Carbon::today()->subDays(89); // 90 days including today
            }
        }
        
        // Get top performing products by turnover rate
        $topProducts = ProductAnalytic::select('product_id', DB::raw('AVG(turnover_rate) as avg_turnover'))
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->groupBy('product_id')
            ->orderByDesc('avg_turnover')
            ->limit(10)
            ->with('product')
            ->get();
        
        // Get products with low stock (below reorder level)
        $lowStockProducts = Product::where('current_stock', '<', DB::raw('reorder_level'))
            ->where('active', true)
            ->orderBy(DB::raw('current_stock / reorder_level'))
            ->limit(10)
            ->get();
        
        // Get out of stock products
        $outOfStockProducts = Product::where('current_stock', 0)
            ->where('active', true)
            ->orderBy('name')
            ->limit(10)
            ->get();
        
        // Get stock movement trends (daily aggregated data)
        $stockMovementTrends = StockMovement::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in'),
                DB::raw('SUM(CASE WHEN type = "out" THEN ABS(quantity) ELSE 0 END) as stock_out')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Calculate inventory value over time using product prices and stock levels
        $inventoryValue = Product::join('product_analytics', 'products.id', '=', 'product_analytics.product_id')
            ->select(
                'product_analytics.date',
                DB::raw('SUM(products.price * products.current_stock) as total_value')
            )
            ->whereDate('product_analytics.date', '>=', $startDate)
            ->whereDate('product_analytics.date', '<=', $endDate)
            ->groupBy('product_analytics.date')
            ->orderBy('product_analytics.date')
            ->get();
        
        // Get product category distribution
        $categoryDistribution = Product::select(
                'category',
                DB::raw('COUNT(*) as product_count'),
                DB::raw('SUM(current_stock) as total_stock'),
                DB::raw('SUM(current_stock * price) as total_value')
            )
            ->whereNotNull('category')
            ->where('active', true)
            ->groupBy('category')
            ->orderByDesc('total_value')
            ->get();
        
        // Get overall inventory statistics
        $inventoryStats = [
            'total_products' => Product::where('active', true)->count(),
            'total_stock' => Product::where('active', true)->sum('current_stock'),
            'total_value' => Product::where('active', true)->sum(DB::raw('current_stock * price')),
            'avg_turnover' => ProductAnalytic::whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->avg('turnover_rate') ?? 0,
            'out_of_stock_count' => Product::where('current_stock', 0)
                ->where('active', true)
                ->count(),
            'low_stock_count' => Product::where('current_stock', '<', DB::raw('reorder_level'))
                ->where('current_stock', '>', 0)
                ->where('active', true)
                ->count(),
        ];
        
        return Inertia::render('Analytics/Index', [
            'products' => Product::with('analytics')->get(),
            'summary' => [
                'total_products' => $inventoryStats['total_products'],
                'total_stock_value' => $inventoryStats['total_value'],
                'low_stock_count' => $inventoryStats['low_stock_count'],
                'out_of_stock_count' => $inventoryStats['out_of_stock_count'],
                'top_selling_products' => Product::select('id', 'name')
                    ->withSum(['stockMovements as total_sold' => function($query) use ($startDate, $endDate) {
                        $query->where('type', 'out')
                              ->whereDate('created_at', '>=', $startDate)
                              ->whereDate('created_at', '<=', $endDate);
                    }], 'quantity')
                    ->orderByRaw('ABS(total_sold) DESC')
                    ->limit(5)
                    ->get()
                    ->map(function($product) {
                        return [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'total_sold' => abs($product->total_sold ?? 0)
                        ];
                    }),
                'stock_movement_summary' => $stockMovementTrends,
            ],
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
