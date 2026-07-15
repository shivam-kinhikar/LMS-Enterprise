<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\LeadActivityLog;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role->role_name === 'User') return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        // if (!$request->user()->hasPermission('view_leads')) return response()->json([], 403);

        $query = Lead::with(['assignedUser', 'creator', 'followups', 'status', 'source']);

        if ($request->has('search') && $request->search !== '') {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('company', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $leads = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Leads retrieved successfully',
            'data' => $leads
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role->role_name === 'User') return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'company' => 'nullable|string',
            'address' => 'nullable|string',
            'industry' => 'nullable|string',
            'campaign' => 'nullable|string',
            'product' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'priority' => 'nullable|string',
            'notes' => 'nullable|string',
            'followup' => 'nullable|date',
            // assigned_user_id can be sent, or we default to null
        ]);

        DB::beginTransaction();
        try {
            $validated['created_by'] = $request->user() ? $request->user()->id : 1;
            
            // Map source name to ID
            if ($request->filled('source')) {
                $source = \App\Models\LeadSource::firstOrCreate(['name' => $request->source]);
                $validated['source_id'] = $source->id;
            }

            // Map status name to ID
            if ($request->filled('status')) {
                $status = \App\Models\LeadStatus::firstOrCreate(['name' => $request->status]);
                $validated['status_id'] = $status->id;
            }

            // Handle assignedTo (dummy string from frontend for now, or actual ID)
            // Just leaving assigned_user_id as null if we can't map it
            $validated['assigned_user_id'] = 1; // Default to admin for now

            $validated['followup_date'] = $request->followup;

            $lead = Lead::create($validated);

            LeadActivityLog::create([
                'lead_id' => $lead->id,
                'user_id' => $validated['created_by'],
                'action' => 'Created',
                'description' => 'Lead created'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lead created successfully',
                'data' => $lead
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating lead',
                'errors' => ['error' => $e->getMessage()]
            ], 500);
        }
    }

    public function show(Request $request, Lead $lead)
    {
        if ($request->user()->role->role_name === 'User') return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);

        $lead->load(['assignedUser', 'followups', 'creator', 'status', 'source']);
        
        return response()->json([
            'success' => true,
            'message' => 'Lead details retrieved',
            'data' => $lead
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        if ($request->user()->role->role_name === 'User') return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);

        $lead->update($request->all());
        
        LeadActivityLog::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'action' => 'Updated',
            'description' => 'Lead details updated'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead updated',
            'data' => $lead
        ]);
    }

    public function destroy(Request $request, Lead $lead)
    {
        $role = $request->user()->role->role_name;
        if (in_array($role, ['User', 'Sales Exec'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to delete leads'], 403);
        }

        $lead->delete();
        return response()->json([
            'success' => true,
            'message' => 'Lead deleted'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $role = $request->user()->role->role_name;
        if (in_array($role, ['User', 'Sales Exec'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to delete leads'], 403);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:leads,id'
        ]);

        Lead::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leads deleted successfully'
        ]);
    }
}
