<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'sku',
        'description',
        'price',
        'current_stock',
        'reorder_level',
        'category',
        'supplier',
        'location',
        'image_path',
        'active',
    ];
    
    /**
     * Get the stock movements for the product.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
    
    /**
     * Get the analytics for the product.
     */
    public function analytics()
    {
        return $this->hasMany(ProductAnalytic::class);
    }
}
