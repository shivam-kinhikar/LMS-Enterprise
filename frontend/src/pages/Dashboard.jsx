import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, IconButton, useTheme, Button, Menu, MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import {
  TrendingUp, PeopleAlt, Call, MoreVert, CalendarMonth, AccessTime, WorkspacePremium
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardStats, clearAllData } from '../api/dashboardService';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, Title, Tooltip, Legend, Filler
);

const StatCard = ({ title, value, icon, iconBg, iconColor, trend, trendText }) => {
  return (
    <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5, letterSpacing: '-0.02em', color: iconColor }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" color="#10b981" fontWeight={600}>
              {Math.abs(trend)}% <Typography component="span" variant="caption" color="text.secondary">{trendText}</Typography>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 1, // Changed from 50% circle to a soft rectangle shape
          bgcolor: iconBg, 
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
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
  const [dateMenuAnchor, setDateMenuAnchor] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('This Month');
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  const clearDataMutation = useMutation({
    mutationFn: clearAllData,
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['followups']);
      queryClient.invalidateQueries(['reports']);
      toast.success('All data has been cleared successfully.');
      setClearDataDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to clear data.');
      setClearDataDialogOpen(false);
    }
  });
  
  const handleDownloadCSV = () => {
    handleSalesMenuClose();
    
    // Create CSV content from chart data
    const headers = ['Month', 'Qualified Leads'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = chartData.datasets[0]?.data || [110, 130, 120, 150, 180, 190];
    
    let csvContent = headers.join(',') + '\\n';
    months.forEach((month, index) => {
      csvContent += `${month},${data[index]}\\n`;
    });
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV downloaded successfully!');
  };

  const handleSalesMenuOpen = (event) => setSalesMenuAnchor(event.currentTarget);
  const handleSalesMenuClose = () => setSalesMenuAnchor(null);

  const handleSourcesMenuOpen = (event) => setSourcesMenuAnchor(event.currentTarget);
  const handleSourcesMenuClose = () => setSourcesMenuAnchor(null);

  const realStats = data || {};
  
  const chartData = useMemo(() => {
    const rawSales = realStats.sales_performance || [];
    // Convert 01..12 to month names for simplicity
    const monthMap = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
    
    const labels = rawSales.map(s => monthMap[s.month] || s.month);
    const chartCounts = rawSales.map(s => s.count);

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [
        {
          label: 'Sales Performance',
          data: chartCounts.length > 0 ? chartCounts : [0],
          borderColor: theme.palette.primary.main,
          backgroundColor: `${theme.palette.primary.main}40`, // Fallback color
          tension: 0.4,
          fill: true,
          pointBackgroundColor: theme.palette.primary.main,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }, [realStats, theme]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 14, family: 'Inter' },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 12 } } },
      y: { 
        border: { display: false }, 
        grid: { color: theme.palette.divider }, 
        ticks: { color: theme.palette.text.secondary, font: { family: 'Inter', size: 12 }, stepSize: 20 },
        min: 100, max: 200
      },
    },
  };

  const doughnutColors = [
    theme.palette.primary.main, // Website
    '#3b82f6', // Referral
    '#10b981', // Social Media
    '#f59e0b', // Email
    '#64748b'  // Others
  ];

  const rawSources = realStats.lead_sources || [];
  const sourceLabels = rawSources.map(s => s.name);
  const sourceValues = rawSources.map(s => s.value);

  const doughnutData = {
    labels: sourceLabels.length > 0 ? sourceLabels : ['No Data'],
    datasets: [
      {
        data: sourceValues.length > 0 ? sourceValues : [1],
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
    plugins: {
      legend: {
        display: false 
      }
    }
  };

  const totalSourceValue = sourceValues.reduce((a, b) => a + b, 0);
  const customLegend = rawSources.map((item, index) => ({
    label: item.name,
    percent: totalSourceValue ? Math.round((item.value / totalSourceValue) * 100) + '%' : '0%',
    color: doughnutColors[index % doughnutColors.length]
  }));

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your leads.
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          color="error"
          sx={{ mr: 2, textTransform: 'none', fontWeight: 600 }}
          onClick={() => setClearDataDialogOpen(true)}
        >
          Clear All Data
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<CalendarMonth fontSize="small" />}
          sx={{ color: 'text.secondary', borderColor: 'divider', bgcolor: 'background.paper', textTransform: 'none' }}
          onClick={(e) => setDateMenuAnchor(e.currentTarget)}
        >
          {selectedDateRange}
        </Button>
        <Menu
          anchorEl={dateMenuAnchor}
          open={Boolean(dateMenuAnchor)}
          onClose={() => setDateMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { setSelectedDateRange('Today'); setDateMenuAnchor(null); }}>Today</MenuItem>
          <MenuItem onClick={() => { setSelectedDateRange('Last 7 Days'); setDateMenuAnchor(null); }}>Last 7 Days</MenuItem>
          <MenuItem onClick={() => { setSelectedDateRange('Last 30 Days'); setDateMenuAnchor(null); }}>Last 30 Days</MenuItem>
          <MenuItem onClick={() => { setSelectedDateRange('This Month'); setDateMenuAnchor(null); }}>This Month</MenuItem>
          <MenuItem onClick={() => { setSelectedDateRange('This Year'); setDateMenuAnchor(null); }}>This Year</MenuItem>
          <MenuItem onClick={() => { setCustomRangeOpen(true); setDateMenuAnchor(null); }}>Custom Range...</MenuItem>
        </Menu>
      </Box>

      {/* Custom Date Range Dialog */}
      <Dialog open={customRangeOpen} onClose={() => setCustomRangeOpen(false)} PaperProps={{ sx: { width: '100%', maxWidth: 400, borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Select Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>From Date</Typography>
              <TextField
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>To Date</Typography>
              <TextField
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setCustomRangeOpen(false)} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            disableElevation
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            onClick={() => {
              if (fromDate && toDate) {
                setSelectedDateRange(`${fromDate} to ${toDate}`);
              } else if (fromDate) {
                setSelectedDateRange(`Since ${fromDate}`);
              }
              setCustomRangeOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDataDialogOpen} onClose={() => setClearDataDialogOpen(false)} PaperProps={{ sx: { width: '100%', maxWidth: 400, borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: 'error.main' }}>Clear All Data?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete ALL leads, follow-ups, and activity logs? This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setClearDataDialogOpen(false)} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            disableElevation
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            onClick={() => clearDataMutation.mutate()}
            disabled={clearDataMutation.isPending}
          >
            {clearDataMutation.isPending ? 'Clearing...' : 'Yes, Delete Everything'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Leads" 
            value={realStats.total_leads || 0} 
            icon={<PeopleAlt />} 
            iconBg="#e0e7ff" 
            iconColor="#4f46e5" 
            trend={12.5} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={`$${Number(realStats.revenue || 0).toLocaleString()}`} 
            icon={<WorkspacePremium />} 
            iconBg="#dcfce7" 
            iconColor="#10b981" 
            trend={8.2} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Won Deals" 
            value={realStats.won_deals || 0} 
            icon={<TrendingUp />} 
            iconBg="#f3e8ff" 
            iconColor="#9333ea" 
            trend={24.1} 
            trendText="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Follow-ups Due" 
            value={realStats.active_followups || 0} 
            icon={<AccessTime />} 
            iconBg="#ffedd5" 
            iconColor="#f59e0b" 
            trend={4.5} 
            trendText="vs last month"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Sales Performance</Typography>
                <Typography variant="body2" color="text.secondary">Monthly qualified leads conversion</Typography>
              </Box>
              <IconButton size="small" onClick={handleSalesMenuOpen}><MoreVert /></IconButton>
              <Menu
                anchorEl={salesMenuAnchor}
                open={Boolean(salesMenuAnchor)}
                onClose={handleSalesMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleSalesMenuClose(); navigate('/reports'); }}>View Report</MenuItem>
                <MenuItem onClick={handleDownloadCSV}>Download CSV</MenuItem>
                <MenuItem onClick={() => { handleSalesMenuClose(); toast.success('Chart data refreshed!'); }}>Refresh Data</MenuItem>
                <MenuItem sx={{ color: 'error.main' }} onClick={() => { handleSalesMenuClose(); setClearDataDialogOpen(true); }}>Clear All Data</MenuItem>
              </Menu>
            </Box>
            <CardContent>
              <Box sx={{ height: 320, mt: 2 }}>
                <Line ref={chartRef} data={chartData} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Lead Sources</Typography>
                <Typography variant="body2" color="text.secondary">Distribution of inbound leads</Typography>
              </Box>
              <IconButton size="small" onClick={handleSourcesMenuOpen}><MoreVert /></IconButton>
              <Menu
                anchorEl={sourcesMenuAnchor}
                open={Boolean(sourcesMenuAnchor)}
                onClose={handleSourcesMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleSourcesMenuClose(); navigate('/leads'); }}>View Details</MenuItem>
                <MenuItem onClick={() => { handleSourcesMenuClose(); window.print(); }}>Export to PDF</MenuItem>
                <MenuItem sx={{ color: 'error.main' }} onClick={() => { handleSourcesMenuClose(); setClearDataDialogOpen(true); }}>Clear All Data</MenuItem>
              </Menu>
            </Box>
            <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%', pb: '24px !important' }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                
                {/* Chart */}
                <Box sx={{ height: 220, width: 220, position: 'relative' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <Box sx={{ position: 'absolute', textAlign: 'center', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <Typography variant="h5" fontWeight={800} color="text.primary">{totalSourceValue}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Leads</Typography>
                  </Box>
                </Box>

                {/* Custom Legend */}
                <Box sx={{ flexGrow: 1, ml: 3 }}>
                  {customLegend.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, mr: 1.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">{item.percent}</Typography>
                    </Box>
                  ))}
                </Box>
                
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
