<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lead;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $leadQuery = Lead::query();
        if ($startDate) $leadQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        if ($endDate) $leadQuery->where('created_at', '<=', $endDate . ' 23:59:59');

        $totalLeads = (clone $leadQuery)->count();
        $wonDeals = (clone $leadQuery)->whereHas('status', function($q) {
            $q->where('name', 'Won');
        })->count();
        
        $followupQuery = \App\Models\Followup::where('status', 'Pending');
        if ($startDate) $followupQuery->where('date', '>=', $startDate);
        if ($endDate) $followupQuery->where('date', '<=', $endDate);
        $activeFollowups = $followupQuery->count();

        // Calculate Revenue
        $revenue = (clone $leadQuery)->whereHas('status', function($q) {
            $q->where('name', 'Won');
        })->sum('budget');

        // Chart 1: Sales Performance
        $salesQuery = Lead::select(\DB::raw("strftime('%m', created_at) as month"), \DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month', 'asc');
        if ($startDate) $salesQuery->where('created_at', '>=', $startDate . ' 00:00:00');
        if ($endDate) $salesQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        $salesPerformance = $salesQuery->get();

        // Chart 2: Lead Sources Distribution
        $leadSourcesQuery = \DB::table('leads')
            ->join('lead_sources', 'leads.source_id', '=', 'lead_sources.id')
            ->whereNull('leads.deleted_at')
            ->select('lead_sources.name', \DB::raw('count(*) as value'))
            ->groupBy('lead_sources.name');
        if ($startDate) $leadSourcesQuery->where('leads.created_at', '>=', $startDate . ' 00:00:00');
        if ($endDate) $leadSourcesQuery->where('leads.created_at', '<=', $endDate . ' 23:59:59');
        $leadSources = $leadSourcesQuery->get();

        // Recent Leads
        $recentLeadsQuery = (clone $leadQuery)->with('status')->orderBy('created_at', 'desc')->take(5);
        $recentLeads = $recentLeadsQuery->get();

        // Upcoming Follow-ups
        $upcomingFollowupsQuery = (clone $followupQuery)->with('lead')->orderBy('date', 'asc')->orderBy('time', 'asc')->take(5);
        $upcomingFollowups = $upcomingFollowupsQuery->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard stats fetched successfully',
            'data' => [
                'total_leads' => $totalLeads,
                'won_deals' => $wonDeals,
                'active_followups' => $activeFollowups,
                'revenue' => $revenue,
                'sales_performance' => $salesPerformance,
                'lead_sources' => $leadSources,
                'recent_leads' => $recentLeads,
                'upcoming_followups' => $upcomingFollowups
            ]
        ]);
    }

    public function clearAllData(Request $request)
    {
        \App\Models\LeadActivityLog::query()->forceDelete();
        \App\Models\Followup::query()->forceDelete();
        \App\Models\Lead::query()->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'All data cleared successfully'
        ]);
    }
}
