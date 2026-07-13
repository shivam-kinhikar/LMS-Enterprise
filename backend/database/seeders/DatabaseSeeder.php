<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin Role
        $superAdminRole = Role::create([
            'role_name' => 'Super Admin'
        ]);

        // Create Default Admin User
        User::create([
            'name' => 'Admin Demo',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $superAdminRole->id,
            'status' => true
        ]);
    }
}
