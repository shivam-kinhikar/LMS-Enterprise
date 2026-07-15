<?php

namespace App\Http\Controllers;

use App\Models\LeadSource;
use Illuminate\Http\Request;

class LeadSourceController extends Controller
{
    public function index()
    {
        return response()->json(LeadSource::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lead_sources,name'
        ]);

        $leadSource = LeadSource::create($validated);

        return response()->json($leadSource, 201);
    }

    public function update(Request $request, LeadSource $leadSource)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lead_sources,name,' . $leadSource->id
        ]);

        $leadSource->update($validated);

        return response()->json($leadSource);
    }

    public function destroy(LeadSource $leadSource)
    {
        // Prevent deleting if it's used by leads
        $inUse = \App\Models\Lead::where('source_id', $leadSource->id)->exists();
        if ($inUse) {
            return response()->json(['message' => 'Cannot delete a source currently in use by leads.'], 400);
        }
        
        $leadSource->delete();

        return response()->json(null, 204);
    }
}
