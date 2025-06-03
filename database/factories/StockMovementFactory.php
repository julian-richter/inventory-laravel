<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['in', 'out', 'adjustment']);
        $quantity = $type === 'in' ? $this->faker->numberBetween(1, 50) : ($type === 'out' ? -$this->faker->numberBetween(1, 20) : $this->faker->numberBetween(-10, 10));
        
        // Get a random product
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        $stockBefore = $product->current_stock;
        $stockAfter = $stockBefore + $quantity;
        
        // Generate reference based on movement type
        $reference = match($type) {
            'in' => 'PO-' . $this->faker->numerify('#####'),
            'out' => 'SO-' . $this->faker->numerify('#####'),
            'adjustment' => 'ADJ-' . $this->faker->numerify('#####'),
        };
        
        return [
            'product_id' => $product->id,
            'quantity' => $quantity,
            'type' => $type,
            'reference' => $reference,
            'notes' => $this->faker->optional(0.7)->sentence(),
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'user_id' => User::inRandomOrder()->first()?->id,
        ];
    }
}
