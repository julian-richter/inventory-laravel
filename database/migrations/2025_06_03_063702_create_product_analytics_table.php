<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('stock_added')->default(0);
            $table->integer('stock_removed')->default(0);
            $table->integer('days_to_restock')->nullable();
            $table->integer('times_out_of_stock')->default(0);
            $table->integer('days_out_of_stock')->default(0);
            $table->decimal('turnover_rate', 8, 2)->nullable();
            $table->decimal('stock_value', 10, 2)->default(0);
            $table->timestamps();
            
            // Create a unique constraint on product_id and date
            $table->unique(['product_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_analytics');
    }
};
