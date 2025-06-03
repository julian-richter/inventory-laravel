<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductAnalytic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductAnalytic>
 */
class ProductAnalyticFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get a random product
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        
        // Generate a date within the last 90 days
        $date = $this->faker->dateTimeBetween('-90 days', 'now')->format('Y-m-d');
        
        $stockAdded = $this->faker->numberBetween(0, 100);
        $stockRemoved = $this->faker->numberBetween(0, $stockAdded + $product->current_stock);
        $timesOutOfStock = $this->faker->numberBetween(0, 5);
        
        return [
            'product_id' => $product->id,
            'date' => $date,
            'stock_added' => $stockAdded,
            'stock_removed' => $stockRemoved,
            'days_to_restock' => $timesOutOfStock > 0 ? $this->faker->numberBetween(1, 10) : null,
            'times_out_of_stock' => $timesOutOfStock,
            'days_out_of_stock' => $timesOutOfStock > 0 ? $this->faker->numberBetween(1, $timesOutOfStock * 3) : 0,
            'turnover_rate' => $this->faker->randomFloat(2, 0.1, 5),
        ];
    }
}
