<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productName = $this->faker->unique()->words(rand(1, 3), true);
        $category = $this->faker->randomElement(['Electronics', 'Clothing', 'Food', 'Furniture', 'Books', 'Tools', 'Office Supplies']);
        
        return [
            'name' => ucwords($productName),
            'sku' => strtoupper(Str::substr(str_replace(' ', '', $category), 0, 3) . '-' . $this->faker->unique()->numerify('######')),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 5, 1000),
            'current_stock' => $this->faker->numberBetween(0, 100),
            'reorder_level' => $this->faker->numberBetween(5, 20),
            'category' => $category,
            'supplier' => $this->faker->company(),
            'location' => $this->faker->randomElement(['Warehouse A', 'Warehouse B', 'Store Front', 'Back Office', 'External Storage']),
            'image_path' => null,
            'active' => $this->faker->boolean(90),
        ];
    }
}
