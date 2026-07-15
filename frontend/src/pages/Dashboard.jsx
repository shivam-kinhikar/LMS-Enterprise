import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Card, CardContent, Typography, Box, IconButton, useTheme, 
  Button, Menu, MenuItem, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Avatar, Chip, Divider, LinearProgress
} from '@mui/material';
import {
  TrendingUp, PeopleAlt, MoreVert, CalendarMonth, AccessTime, 
  AttachMoney, Delete, EventNote, Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardStats, clearAllData } from '../api/dashboardService';
import { fetchReports } from '../api/reportService';
import CategoryManagerModal from '../components/CategoryManagerModal';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, Title, Tooltip, Legend, Filler
);

// Styled Stat Card matching the user's design
const StatCard = ({ title, value, icon, iconBg, iconColor, valueColor, trend, trendText }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: '16px',
      border: 'none',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
    }}>
      <CardContent sx={{ p: 3, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 1 }}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, mb: 3 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: valueColor || iconColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {value}
          </Typography>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '14px', 
            background: iconBg, 
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption" color="#10b981" fontWeight={700}>
            {Math.abs(trend)}% <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>{trendText}</Typography>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const navigate = useNavigate();
  
  const [salesMenuAnchor, setSalesMenuAnchor] = useState(null);
  const [sourcesMenuAnchor, setSourcesMenuAnchor] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats', startDate, endDate],
    queryFn: () => fetchDashboardStats({ start_date: startDate, end_date: endDate })
  });

  const { data: reportsData } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports
  });
  const reports = reportsData || {};
  const funnel = reports.funnel || { total: 0, contacted: 0, proposal: 0, won: 0 };

  const clearDataMutation = useMutation({
    mutationFn: clearAllData,
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success('All data has been cleared successfully.');
      setClearDataDialogOpen(false);
    }
  });

  const realStats = data || {};
  const recentLeads = realStats.recent_leads || [];
  const upcomingFollowups = realStats.upcoming_followups || [];

  const handleExportCSV = (exportData, filename) => {
    if (!exportData || !exportData.length) {
      toast.info('No data available to export');
      return;
    }
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${filename} exported successfully!`);
  };

  
  // Prepare Line Chart Data with vibrant purple gradient
  const chartData = useMemo(() => {
    const rawSales = realStats.sales_performance || [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let labels = [];
    let chartCounts = [];

    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const monthLabel = monthNames[d.getMonth()];
      
      labels.push(monthLabel);
      
      const stat = rawSales.find(s => s.month === monthStr);
      chartCounts.push(stat ? parseInt(stat.count, 10) : 0);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Sales Performance',
          data: chartCounts,
          borderColor: '#5b45f1',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(91, 69, 241, 0.4)');
            gradient.addColorStop(1, 'rgba(91, 69, 241, 0.0)');
            return gradient;
          },
          tension: 0.1, // Slight curve, mostly straight like design
          fill: true,
          pointBackgroundColor: '#5b45f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [realStats]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#5b45f1',
        padding: 10,
        displayColors: false,
        callbacks: {
          title: () => null, // Hide title
          label: (context) => context.raw, // Just show the number
        }
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 12 } } 
      },
      y: { 
        border: { display: false }, 
        grid: { color: '#f3f4f6', borderDash: [5, 5] }, 
        ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 12 } },
        beginAtZero: true
      },
    },
  };

  // Prepare Doughnut Chart Data
  const doughnutColors = ['#5b45f1', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];
  const rawSources = realStats.lead_sources || [];
  let sourceLabels = rawSources.map(s => s.name);
  let sourceValues = rawSources.map(s => s.value);

  if (sourceLabels.length === 0) {
    sourceLabels = ['Website'];
    sourceValues = [1];
  }

  const doughnutData = {
    labels: sourceLabels,
    datasets: [
      {
        data: sourceValues,
        backgroundColor: doughnutColors,
        borderWidth: 0,
        hoverOffset: 4, 
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: { legend: { display: false } },
  };

  const totalSourceValue = sourceValues.reduce((a, b) => a + b, 0);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 3 }, minHeight: '100vh', mt: -3, mx: -3 }}>
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5, letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your leads today.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<Delete fontSize="small" />}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: 'none' }}
            onClick={() => setClearDataDialogOpen(true)}
          >
            Clear All Data
          </Button>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputProps={{ sx: { bgcolor: '#fff', borderRadius: '8px', color: '#475569', fontWeight: 600 } }}
          />
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputProps={{ sx: { bgcolor: '#fff', borderRadius: '8px', color: '#475569', fontWeight: 600 } }}
          />
        </Box>
      </Box>

      {/* STAT CARDS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Leads" 
            value={realStats.total_leads || 1} 
            icon={<PeopleAlt />} 
            iconBg="#f3e8ff" 
            iconColor="#5b45f1" 
            trend={12.5} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={`₹${Number(realStats.revenue || 5000).toLocaleString()}`} 
            icon={<AttachMoney />} 
            iconBg="#dcfce7" 
            iconColor="#10b981" 
            trend={8.2} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Won Deals" 
            value={realStats.won_deals || 1} 
            icon={<TrendingUp />} 
            iconBg="#f5f3ff" 
            iconColor="#8b5cf6" 
            trend={24.1} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Follow-ups Due" 
            value={realStats.active_followups || 1} 
            icon={<AccessTime />} 
            iconBg="#ffedd5" 
            iconColor="#f59e0b" 
            valueColor="#f59e0b"
            trend={4.5} 
            trendText="vs last month"
          />
        </Grid>
      </Grid>
      
      {/* MIDDLE SECTION */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* MAIN CHART */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Sales Performance</Typography>
                <Typography variant="body2" color="text.secondary">Monthly qualified leads conversion</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={(e) => setSalesMenuAnchor(e.currentTarget)}><MoreVert fontSize="small" /></IconButton>
              </Box>
            </Box>
            <CardContent>
              <Box sx={{ height: 280, mt: 2 }}>
                <Line ref={chartRef} data={chartData} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* LEAD SOURCES (DOUGHNUT) */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Lead Sources</Typography>
                <Typography variant="body2" color="text.secondary">Distribution of inbound leads</Typography>
              </Box>
              <IconButton size="small" onClick={(e) => setSourcesMenuAnchor(e.currentTarget)}><MoreVert fontSize="small" /></IconButton>
            </Box>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Box sx={{ height: 200, width: 200, position: 'relative' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <Box sx={{ position: 'absolute', textAlign: 'center', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <Typography variant="h4" fontWeight={800} color="text.primary">{totalSourceValue}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Total Leads</Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5b45f1', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Website</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2.5 }}>100%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN STACK */}
        <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* RECENT LEADS */}
          <Card sx={{ borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', flexGrow: 1 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>Recent Leads</Typography>
              <Button size="small" sx={{ textTransform: 'none', bgcolor: '#f3e8ff', color: '#5b45f1', borderRadius: '8px', px: 2, '&:hover': { bgcolor: '#e9d5ff' } }} onClick={() => navigate('/leads')}>View All</Button>
            </Box>
            <Divider sx={{ mx: 2.5 }} />
            <CardContent sx={{ p: '20px 24px !important' }}>
              {recentLeads.length > 0 ? recentLeads.map(lead => (
                <Box key={lead.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#f3e8ff', color: '#5b45f1', fontWeight: 600, width: 40, height: 40, mr: 2 }}>
                      {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                        {lead.name} 
                        {lead.status?.name === 'New' && (
                          <Chip label="New" size="small" sx={{ ml: 1, height: 20, fontSize: '0.65rem', bgcolor: '#f3e8ff', color: '#5b45f1', fontWeight: 700 }} />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{lead.email}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary">No recent leads found.</Typography>
              )}
            </CardContent>
          </Card>

          {/* UPCOMING FOLLOW-UPS */}
          <Card sx={{ borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', flexGrow: 1 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>Upcoming Follow-ups</Typography>
              <Button size="small" sx={{ textTransform: 'none', bgcolor: '#f3e8ff', color: '#5b45f1', borderRadius: '8px', px: 2, '&:hover': { bgcolor: '#e9d5ff' } }} onClick={() => navigate('/followups')}>View All</Button>
            </Box>
            <Divider sx={{ mx: 2.5 }} />
            <CardContent sx={{ p: '20px 24px !important' }}>
              {upcomingFollowups.length > 0 ? upcomingFollowups.map(followup => (
                <Box key={followup.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <EventNote fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Follow up with {followup.lead?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(followup.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {followup.time || '10:00 AM'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={followup.status} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 700, borderRadius: '6px' }} />
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary">No upcoming follow-ups.</Typography>
              )}
            </CardContent>
          </Card>

          {/* TASKS SUMMARY */}
          <Card sx={{ borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', flexGrow: 1 }}>
            <Box sx={{ p: 2.5, pb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>Tasks Summary</Typography>
            </Box>
            <CardContent sx={{ pt: 1, pb: '20px !important' }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: '#f3e8ff', p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>1</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Pending</Typography>
                    </Box>
                    <AccessTime sx={{ color: '#8b5cf6', fontSize: 18 }} />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: '#dcfce7', p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>0</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Completed</Typography>
                    </Box>
                    <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ bgcolor: '#ffe4e6', p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>0</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Overdue</Typography>
                    </Box>
                    <AccessTime sx={{ color: '#f43f5e', fontSize: 18 }} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        </Grid>
      </Grid>
      
      {/* BOTTOM SECTION - LEAD STATUS OVERVIEW */}
      <Card sx={{ borderRadius: '16px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <Box sx={{ p: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Lead Status Overview</Typography>
            <Typography variant="body2" color="text.secondary">Current status of all leads</Typography>
          </Box>
          <Button size="small" sx={{ textTransform: 'none', bgcolor: '#f3e8ff', color: '#5b45f1', borderRadius: '8px', px: 2, '&:hover': { bgcolor: '#e9d5ff' } }} onClick={() => setReportModalOpen(true)}>View Full Report</Button>
        </Box>
        <CardContent sx={{ pt: 1, pb: '24px !important' }}>
          <Grid container spacing={4}>
            {[
              { label: 'New', count: 1, color: '#5b45f1' },
              { label: 'Contacted', count: 0, color: '#3b82f6' },
              { label: 'In Progress', count: 0, color: '#f59e0b' },
              { label: 'Qualified', count: 0, color: '#10b981' },
              { label: 'Won', count: 1, color: '#22c55e' },
              { label: 'Lost', count: 0, color: '#ef4444' }
            ].map((status, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{status.label}</Typography>
                  <Typography variant="subtitle1" fontWeight={800}>{status.count}</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: status.color }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* DIALOGS AND MENUS */}


      <Menu anchorEl={salesMenuAnchor} open={Boolean(salesMenuAnchor)} onClose={() => setSalesMenuAnchor(null)}>
        <MenuItem onClick={() => { handleExportCSV(realStats.sales_performance || [], 'sales_performance.csv'); setSalesMenuAnchor(null); }}>Export as CSV</MenuItem>
        <MenuItem onClick={() => { queryClient.invalidateQueries(['dashboardStats']); toast.success('Chart refreshed'); setSalesMenuAnchor(null); }}>Refresh Chart</MenuItem>
        <MenuItem onClick={() => { navigate('/reports'); setSalesMenuAnchor(null); }}>View Detail Report</MenuItem>
      </Menu>

      <Menu anchorEl={sourcesMenuAnchor} open={Boolean(sourcesMenuAnchor)} onClose={() => setSourcesMenuAnchor(null)}>
        <MenuItem onClick={() => { handleExportCSV(realStats.lead_sources || [], 'lead_sources.csv'); setSourcesMenuAnchor(null); }}>Export as CSV</MenuItem>
        <MenuItem onClick={() => { setCategoryModalOpen(true); setSourcesMenuAnchor(null); }}>Edit Categories</MenuItem>
      </Menu>
      <Dialog open={clearDataDialogOpen} onClose={() => setClearDataDialogOpen(false)} PaperProps={{ sx: { width: '100%', maxWidth: 400, borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: 'error.main' }}>Clear All Data?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete ALL leads, follow-ups, and activity logs? This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setClearDataDialogOpen(false)} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} onClick={() => clearDataMutation.mutate()}>
            {clearDataMutation.isPending ? 'Clearing...' : 'Yes, Delete Everything'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PREMIUM FULL REPORT MODAL */}
      <Dialog 
        open={reportModalOpen} 
        onClose={() => setReportModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
            backgroundImage: 'none',
            bgcolor: '#ffffff',
            m: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* LEFT COLUMN: Funnel Metrics */}
          <Box sx={{ 
            width: { xs: '100%', md: '55%' }, 
            p: 4, 
            bgcolor: '#fafafa',
            borderRight: { xs: 'none', md: '1px solid #f0f0f0' },
            borderBottom: { xs: '1px solid #f0f0f0', md: 'none' }
          }}>
            <Typography variant="h6" fontWeight={800} color="#111827" mb={1}>Pipeline Velocity</Typography>
            <Typography variant="body2" color="#6b7280" mb={4}>Lead progression from acquisition to closed-won.</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#374151">Total Leads Generated</Typography>
                  <Typography variant="body2" fontWeight={800} color="#111827">{funnel.total}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 4 } }} 
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#374151">Contacted & Qualified</Typography>
                  <Typography variant="body2" fontWeight={800} color="#111827">{funnel.contacted}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={funnel.total > 0 ? (funnel.contacted / funnel.total) * 100 : 0} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 4 } }} 
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#374151">Proposal Sent</Typography>
                  <Typography variant="body2" fontWeight={800} color="#111827">{funnel.proposal}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={funnel.total > 0 ? (funnel.proposal / funnel.total) * 100 : 0} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 4 } }} 
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#374151">Deals Won</Typography>
                  <Typography variant="body2" fontWeight={800} color="#10b981">{funnel.won}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={funnel.total > 0 ? (funnel.won / funnel.total) * 100 : 0} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 4 } }} 
                />
              </Box>
            </Box>
          </Box>

          {/* RIGHT COLUMN: Key KPI */}
          <Box sx={{ width: { xs: '100%', md: '45%' }, p: 4, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button onClick={() => setReportModalOpen(false)} sx={{ minWidth: 0, p: 1, color: '#9ca3af', '&:hover': { bgcolor: '#f3f4f6', color: '#4b5563' } }}>
                <Typography variant="caption" fontWeight={600} textTransform="none">Close</Typography>
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
              <Typography variant="overline" color="#6b7280" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>Overall Conversion Rate</Typography>
              <Typography variant="h1" fontWeight={800} sx={{ color: '#111827', mt: 1, mb: 1, letterSpacing: '-0.03em' }}>
                {funnel.total > 0 ? ((funnel.won / funnel.total) * 100).toFixed(1) : 0}<Typography component="span" variant="h3" color="#9ca3af" fontWeight={600}>%</Typography>
              </Typography>
              <Typography variant="body2" color="#6b7280" sx={{ lineHeight: 1.6 }}>
                This represents the percentage of leads that successfully passed through all stages and resulted in a closed-won deal.
              </Typography>
              
              <Box sx={{ mt: 5, p: 2.5, borderRadius: '12px', border: '1px solid #f3f4f6', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <Box>
                    <Typography variant="caption" color="#6b7280" fontWeight={600} textTransform="uppercase">Lost Deals</Typography>
                    <Typography variant="h6" fontWeight={800} color="#ef4444">{funnel.total > 0 ? funnel.total - funnel.won : 0}</Typography>
                 </Box>
                 <Box sx={{ width: 1, height: 40, bgcolor: '#f3f4f6' }} />
                 <Box>
                    <Typography variant="caption" color="#6b7280" fontWeight={600} textTransform="uppercase">Revenue Impact</Typography>
                    <Typography variant="h6" fontWeight={800} color="#111827">₹{Number(realStats.revenue || 5000).toLocaleString()}</Typography>
                 </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
      
      <CategoryManagerModal 
        open={categoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
      />
    </Box>
  );
};

export default Dashboard;
