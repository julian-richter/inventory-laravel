<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Apply search filter if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        // Apply category filter if provided
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }
        
        // Apply stock status filter if provided
        if ($request->has('stock_status')) {
            $stockStatus = $request->input('stock_status');
            if ($stockStatus === 'in_stock') {
                $query->where('current_stock', '>', 0);
            } elseif ($stockStatus === 'out_of_stock') {
                $query->where('current_stock', 0);
            } elseif ($stockStatus === 'low_stock') {
                $query->whereColumn('current_stock', '<', 'reorder_level');
            }
        }
        
        // Get all unique categories for the filter dropdown
        $categories = Product::distinct()->pluck('category')->filter()->values();
        
        // Get paginated products with their latest stock movement
        $products = $query->with(['stockMovements' => function ($query) {
            $query->latest()->limit(1);
        }])->paginate(10)->withQueryString();
        
        return Inertia::render('Inventory/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'stock_status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all unique categories for the dropdown
        $categories = Product::distinct()->pluck('category')->filter()->values();
        
        return Inertia::render('Inventory/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'current_stock' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:100',
            'image_path' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);
        
        // Create the product
        $product = Product::create($validated);
        
        // If initial stock is provided, create a stock movement
        if ($request->input('current_stock') > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'quantity' => $request->input('current_stock'),
                'type' => 'in',
                'reference' => 'Initial Stock',
                'notes' => 'Initial stock when product was created',
                'stock_before' => 0,
                'stock_after' => $request->input('current_stock'),
                'user_id' => Auth::id(),
            ]);
        }
        
        return Redirect::route('inventory.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Load the product with its stock movements and analytics
        $product->load([
            'stockMovements' => function ($query) {
                $query->latest()->limit(10);
            },
            'analytics' => function ($query) {
                $query->latest('date')->limit(30);
            },
        ]);
        
        return Inertia::render('Inventory/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // Get all unique categories for the dropdown
        $categories = Product::distinct()->pluck('category')->filter()->values();
        
        return Inertia::render('Inventory/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:100',
            'image_path' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);
        
        // Check if stock has changed
        $oldStock = $product->current_stock;
        $newStock = $request->input('current_stock');
        
        if ($newStock != $oldStock) {
            // Calculate the difference
            $difference = $newStock - $oldStock;
            $type = $difference > 0 ? 'in' : ($difference < 0 ? 'out' : 'adjustment');
            
            // Create a stock movement record
            StockMovement::create([
                'product_id' => $product->id,
                'quantity' => $difference,
                'type' => $type,
                'reference' => 'Stock Adjustment',
                'notes' => 'Stock adjusted during product update',
                'stock_before' => $oldStock,
                'stock_after' => $newStock,
                'user_id' => Auth::id(),
            ]);
            
            // Add current_stock to validated data
            $validated['current_stock'] = $newStock;
        }
        
        // Update the product
        $product->update($validated);
        
        return Redirect::route('inventory.show', $product->id)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete the product (related records will be deleted via cascade)
        $product->delete();
        
        return Redirect::route('inventory.index')
            ->with('success', 'Product deleted successfully.');
    }
}
