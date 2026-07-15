<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => User::with('role')->get()
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role->role_name !== 'Super Admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Only Super Admin can add members.'], 403);
        }
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id'
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        if ($request->user()->role->role_name !== 'Super Admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Only Super Admin can edit members.'], 403);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role_id' => 'sometimes|exists:roles,id',
            'status' => 'sometimes|boolean'
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function uploadAvatar(Request $request, User $user)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => '/storage/' . $path]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'data' => $user
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image provided'
        ], 400);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->role->role_name !== 'Super Admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Only Super Admin can delete members.'], 403);
        }
        $user->delete();
        return response()->json(['success' => true, 'message' => 'User deleted']);
    }
}
