<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductAnalytic;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating products...');
        // Create 20 products (reduced from 50 for faster seeding)
        $products = Product::factory(20)->create();
        
        // Get a user ID for the stock movements
        $userId = User::first()->id;
        
        $this->command->info('Creating stock movements...');
        // Prepare batch data for stock movements
        $stockMovements = [];
        $productUpdates = [];
        
        foreach ($products as $product) {
            // Create between 3-8 stock movements per product (reduced for faster seeding)
            $movementsCount = rand(3, 8);
            
            // Track the current stock for this product
            $currentStock = $product->current_stock;
            
            // Create stock movements over the past 90 days
            for ($i = 0; $i < $movementsCount; $i++) {
                $date = Carbon::now()->subDays(rand(1, 90));
                
                // Determine movement type with weighted probability
                $typeRand = rand(1, 10);
                $type = match(true) {
                    $typeRand <= 5 => 'in',  // 50% chance of stock in
                    $typeRand <= 9 => 'out', // 40% chance of stock out
                    default => 'adjustment',  // 10% chance of adjustment
                };
                
                // Generate quantity based on type
                $quantity = match($type) {
                    'in' => rand(5, 50),
                    'out' => -min(rand(1, 20), $currentStock), // Can't remove more than current stock
                    'adjustment' => rand(-5, 5),
                };
                
                // Calculate stock before and after
                $stockBefore = $currentStock;
                $stockAfter = max(0, $currentStock + $quantity); // Stock can't go below 0
                
                // Update the tracking variable
                $currentStock = $stockAfter;
                
                // Add to batch array instead of creating individually
                $stockMovements[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'type' => $type,
                    'reference' => $type === 'in' ? 'Stock Purchase' : ($type === 'out' ? 'Customer Order' : 'Inventory Check'),
                    'notes' => $type === 'in' ? 'Received new stock' : ($type === 'out' ? 'Fulfilled order' : 'Adjusted inventory count'),
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'user_id' => $userId,
                    'created_at' => $date,
                    'updated_at' => $date,
                ];
            }
            
            // Store product updates for batch update
            $productUpdates[$product->id] = $currentStock;
        }
        
        // Insert stock movements in chunks to avoid memory issues
        $chunks = array_chunk($stockMovements, 100);
        foreach ($chunks as $chunk) {
            StockMovement::insert($chunk);
        }
        
        // Update product stock levels in batch
        $this->command->info('Updating product stock levels...');
        foreach ($productUpdates as $productId => $stock) {
            Product::where('id', $productId)->update(['current_stock' => $stock]);
        }
        
        $this->command->info('Creating product analytics...');
        // Prepare batch data for analytics
        $analytics = [];
        $now = Carbon::now();
        
        foreach ($products as $product) {
            // Get all stock movements for this product
            $productMovements = StockMovement::where('product_id', $product->id)->get();
            
            // Create analytics for the past 15 days instead of 30 (reduced for faster seeding)
            $startDate = $now->copy()->subDays(15);
            
            for ($day = 0; $day < 15; $day++) {
                $date = $startDate->copy()->addDays($day);
                $dateString = $date->format('Y-m-d');
                
                // Filter movements for this day
                $dayMovements = $productMovements->filter(function ($movement) use ($dateString) {
                    return Carbon::parse($movement->created_at)->format('Y-m-d') === $dateString;
                });
                
                $stockAdded = $dayMovements->where('type', 'in')->sum('quantity') ?: rand(0, 20);
                $stockRemoved = abs($dayMovements->where('type', 'out')->sum('quantity')) ?: rand(0, 15);
                
                // Randomly determine if product was out of stock that day
                $wasOutOfStock = rand(1, 10) === 1; // 10% chance of being out of stock
                $turnoverRate = $stockRemoved > 0 ? $stockRemoved / max(1, $product->current_stock) : 0;
                
                // Add to batch array
                $analytics[] = [
                    'product_id' => $product->id,
                    'date' => $dateString,
                    'stock_added' => $stockAdded,
                    'stock_removed' => $stockRemoved,
                    'days_to_restock' => rand(1, 7),
                    'times_out_of_stock' => $wasOutOfStock ? 1 : 0,
                    'days_out_of_stock' => $wasOutOfStock ? 1 : 0,
                    'turnover_rate' => $turnoverRate,
                    'stock_value' => $product->current_stock * $product->price,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // Insert analytics in chunks
        $chunks = array_chunk($analytics, 100);
        foreach ($chunks as $chunk) {
            ProductAnalytic::insert($chunk);
        }
        
        $this->command->info('Inventory seeding completed!');
    }
}
