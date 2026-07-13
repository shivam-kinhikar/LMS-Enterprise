<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = ['Admin', 'Sales Head', 'Manager', 'Sales Exec', 'User'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['role_name' => $role]);
        }
    }
}
