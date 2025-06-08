<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\DevUserCreatedMail;
use Illuminate\Database\Seeder;

class DevUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Str::random(12);
        $email = 'dev@laravel.local'; // Email address for the dev user

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Dev',
                'password' => Hash::make($password),
                'email_verified_at' => now(), // Optionally mark email as verified
            ]
        );

        // Send the email with the credentials
        // The Mailable expects a 'username', so we'll pass the email address as the username
        Mail::to($user->email)->send(new DevUserCreatedMail($user->email, $password));

        $this->command->info('Dev user created/updated successfully. Credentials sent to ' . $user->email);
        $this->command->info('Email (for login): ' . $user->email);
        $this->command->info('Password: ' . $password);
    }
}
