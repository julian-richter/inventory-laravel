<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = StockMovement::query()->with(['product', 'user']);
        
        // Apply product filter if provided
        if ($request->has('product_id') && $request->input('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }
        
        // Apply movement type filter if provided
        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }
        
        // Apply date range filter if provided
        if ($request->has('date_from') && $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        
        if ($request->has('date_to') && $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
        
        // Get all products for the filter dropdown
        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        
        // Get paginated stock movements
        $stockMovements = $query->latest()->paginate(15)->withQueryString();
        
        return Inertia::render('Inventory/Movements/Index', [
            'stockMovements' => $stockMovements,
            'products' => $products,
            'filters' => $request->only(['product_id', 'type', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all products for the dropdown
        $products = Product::select('id', 'name', 'sku', 'current_stock')
            ->where('active', true)
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Inventory/Movements/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|not_in:0',
            'type' => 'required|in:in,out,adjustment',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);
        
        // Get the product
        $product = Product::findOrFail($validated['product_id']);
        
        // Adjust quantity based on movement type
        if ($validated['type'] === 'out' && $validated['quantity'] > 0) {
            $validated['quantity'] = -$validated['quantity'];
        }
        
        // Calculate stock before and after
        $stockBefore = $product->current_stock;
        $stockAfter = max(0, $stockBefore + $validated['quantity']);
        
        // Create the stock movement
        StockMovement::create([
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'type' => $validated['type'],
            'reference' => $validated['reference'],
            'notes' => $validated['notes'],
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'user_id' => Auth::id(),
        ]);
        
        // Update the product's current stock
        $product->update(['current_stock' => $stockAfter]);
        
        return Redirect::route('inventory.movements.index')
            ->with('success', 'Stock movement recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(StockMovement $stockMovement)
    {
        // Load the stock movement with its product and user
        $stockMovement->load(['product', 'user']);
        
        return Inertia::render('Inventory/Movements/Show', [
            'stockMovement' => $stockMovement,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Stock movements should not be editable after creation
        // to maintain inventory integrity
        return Redirect::route('inventory.movements.index')
            ->with('error', 'Stock movements cannot be edited after creation.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Stock movements should not be editable after creation
        // to maintain inventory integrity
        return Redirect::route('inventory.movements.index')
            ->with('error', 'Stock movements cannot be edited after creation.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Stock movements should not be deletable after creation
        // to maintain inventory integrity
        return Redirect::route('inventory.movements.index')
            ->with('error', 'Stock movements cannot be deleted after creation.');
    }
}
