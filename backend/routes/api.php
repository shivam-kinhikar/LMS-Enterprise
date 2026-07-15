<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FollowupController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\LeadSourceController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'User fetched',
            'data' => $request->user()->load('role.permissions')
        ]);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::delete('/dashboard/clear', [DashboardController::class, 'clearAllData']);
    Route::post('/leads/bulk-delete', [LeadController::class, 'bulkDelete']);
    Route::apiResource('leads', LeadController::class);
    Route::apiResource('followups', FollowupController::class);
    Route::post('/users/{user}/avatar', [UserController::class, 'uploadAvatar']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('lead-sources', LeadSourceController::class);
    Route::get('/roles', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Role::all()
        ]);
    });
    Route::get('/reports', [ReportController::class, 'index']);
});
