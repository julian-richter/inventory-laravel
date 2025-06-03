<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockMovementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Products routes
    Route::get('/inventory', [ProductController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/create', [ProductController::class, 'create'])->name('inventory.create');
    Route::post('/inventory', [ProductController::class, 'store'])->name('inventory.store');
    
    // Analytics routes - must be before wildcard routes
    Route::get('/inventory/analytics', [AnalyticsController::class, 'index'])->name('inventory.analytics.index');
    
    // Stock movements routes - must be before wildcard routes
    Route::get('/inventory/movements', [StockMovementController::class, 'index'])->name('inventory.movements.index');
    Route::get('/inventory/movements/create', [StockMovementController::class, 'create'])->name('inventory.movements.create');
    Route::post('/inventory/movements', [StockMovementController::class, 'store'])->name('inventory.movements.store');
    Route::get('/inventory/movements/{stockMovement}', [StockMovementController::class, 'show'])->name('inventory.movements.show');
    
    // Product wildcard routes - must be after specific routes
    Route::get('/inventory/{product}', [ProductController::class, 'show'])->name('inventory.show');
    Route::get('/inventory/{product}/edit', [ProductController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{product}', [ProductController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{product}', [ProductController::class, 'destroy'])->name('inventory.destroy');
});
