<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user if it doesn't exist
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }
        
        // Create some additional users for testing (only if we have fewer than 5 users)
        $userCount = User::count();
        if ($userCount < 6) {
            User::factory(6 - $userCount)->create();
        }
        
        // Seed the inventory data
        $this->call([
            InventorySeeder::class,
        ]);

        // Seed the dev user in local environment
        if (app()->environment('local')) {
            $this->command->info('Local environment detected, running DevUserSeeder...');
            $this->call(DevUserSeeder::class);
        }
    }
}
