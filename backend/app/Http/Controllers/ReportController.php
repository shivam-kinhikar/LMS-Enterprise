<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $leads = Lead::with(['source', 'assignedUser', 'status'])->get();

        // 1. Performance (Daily, Weekly, Monthly)
        $daily = $leads->groupBy(function($date) {
            return \Carbon\Carbon::parse($date->created_at)->format('D'); // Mon, Tue...
        })->map(function($group, $key) {
            return [
                'name' => $key,
                'leads' => $group->count(),
                'won' => $group->where('status.name', 'Won')->count()
            ];
        })->values()->take(7);

        $weekly = $leads->groupBy(function($date) {
            return 'Week ' . \Carbon\Carbon::parse($date->created_at)->weekOfMonth;
        })->map(function($group, $key) {
            return ['name' => $key, 'leads' => $group->count(), 'won' => $group->where('status.name', 'Won')->count()];
        })->values();

        $monthly = $leads->groupBy(function($date) {
            return \Carbon\Carbon::parse($date->created_at)->format('M');
        })->map(function($group, $key) {
            return ['name' => $key, 'leads' => $group->count(), 'won' => $group->where('status.name', 'Won')->count()];
        })->values();

        // 2. Revenue Data (Monthly)
        $revenueData = $leads->where('status.name', 'Won')->groupBy(function($date) {
            return \Carbon\Carbon::parse($date->created_at)->format('M');
        })->map(function($group, $key) {
            $rev = $group->sum('budget');
            return [
                'month' => $key,
                'revenue' => $rev,
                'target' => $rev * 1.2 // arbitrary +20% target
            ];
        })->values();

        // 3. Source Data
        $sourceData = $leads->groupBy(function($lead) {
            return $lead->source ? $lead->source->name : 'Unknown';
        })->map(function($group, $key) {
            return ['name' => $key, 'value' => $group->count()];
        })->values();

        // 4. Agent Ranking
        $agentRanking = $leads->groupBy(function($lead) {
            return $lead->assignedUser ? $lead->assignedUser->name : 'Unknown';
        })->map(function($group, $key) {
            $deals = $group->where('status.name', 'Won')->count();
            $totalLeads = $group->count();
            $rev = $group->where('status.name', 'Won')->sum('budget');
            return [
                'name' => $key,
                'deals' => $deals,
                'revenue' => '$' . number_format($rev),
                'raw_revenue' => $rev,
                'conversion' => $totalLeads > 0 ? round(($deals / $totalLeads) * 100) . '%' : '0%',
                'status' => $deals > 10 ? 'Top Performer' : ($deals > 5 ? 'On Target' : 'Needs Coaching')
            ];
        })->sortByDesc('raw_revenue')->values();

        // 5. Funnel
        $totalLeads = $leads->count();
        $contacted = $leads->whereIn('status.name', ['Contacted', 'Qualified', 'Proposal', 'Won'])->count();
        $proposal = $leads->whereIn('status.name', ['Proposal', 'Won'])->count();
        $won = $leads->where('status.name', 'Won')->count();

        $funnel = [
            'total' => $totalLeads,
            'contacted' => $contacted,
            'proposal' => $proposal,
            'won' => $won
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'performance' => [
                    'daily' => $daily,
                    'weekly' => $weekly,
                    'monthly' => $monthly
                ],
                'revenue' => $revenueData,
                'sources' => $sourceData,
                'agents' => $agentRanking,
                'funnel' => $funnel
            ]
        ]);
    }
}
