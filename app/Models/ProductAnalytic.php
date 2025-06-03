<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAnalytic extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'date',
        'stock_added',
        'stock_removed',
        'days_to_restock',
        'times_out_of_stock',
        'days_out_of_stock',
        'turnover_rate',
    ];
    
    /**
     * Get the product that owns the analytics.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
