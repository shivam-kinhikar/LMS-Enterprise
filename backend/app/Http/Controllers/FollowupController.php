<?php

namespace App\Http\Controllers;

use App\Models\Followup;
use Illuminate\Http\Request;

class FollowupController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Followup::with(['lead', 'user'])->orderBy('date')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'type' => 'required|string',
            'date' => 'required|date',
            'time' => 'nullable',
            'remarks' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $followup = Followup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Followup scheduled',
            'data' => $followup
        ], 201);
    }

    public function update(Request $request, Followup $followup)
    {
        $followup->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Followup updated',
            'data' => $followup
        ]);
    }

    public function destroy(Followup $followup)
    {
        $followup->delete();
        return response()->json(['success' => true]);
    }
}
