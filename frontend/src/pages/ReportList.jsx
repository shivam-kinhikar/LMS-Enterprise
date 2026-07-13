import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, 
  Button, Menu, MenuItem, ToggleButtonGroup, ToggleButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FileDownload, Assessment, MonetizationOn, TrendingUp, PieChart as PieChartIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../api/reportService';
import { CircularProgress } from '@mui/material';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#34D399'];

const ReportList = () => {
  const [tab, setTab] = useState(0);
  const [timeframe, setTimeframe] = useState('weekly');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['reports'],
    queryFn: () => fetchReports(),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Failed to load reports.</Typography>
      </Box>
    );
  }

  const reports = responseData?.data || {};
  const performanceData = reports.performance || { daily: [], weekly: [], monthly: [] };
  const revenueData = reports.revenue || [];
  const sourceData = reports.sources || [];
  const agentRanking = reports.agents || [];
  const funnel = reports.funnel || { total: 0, contacted: 0, proposal: 0, won: 0 };
  
  // KPI Calculations
  const totalARR = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  // Estimate pipeline by multiplying open deals by avg size or just placeholder since backend didn't aggregate pipeline value, we use a static or sum of all non-won budget.
  // We'll calculate conversion percent safely
  const conversionPercent = funnel.total > 0 ? ((funnel.won / funnel.total) * 100).toFixed(1) : 0.0;

  const handleExport = (format) => {
    setExportAnchorEl(null);
    if (format === 'PDF') {
      window.print();
    } else {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (tab === 0) {
        csvContent += "Performance Data (" + timeframe + ")\n";
        csvContent += "Time,New Leads,Deals Won\n";
        performanceData[timeframe].forEach(row => {
          csvContent += `${row.name},${row.leads},${row.won}\n`;
        });
      } else if (tab === 1) {
        csvContent += "Executive & Revenue\n";
        csvContent += "Month,Actual Revenue,Target Goal\n";
        revenueData.forEach(row => {
          csvContent += `${row.month},${row.revenue},${row.target}\n`;
        });
        csvContent += "\nAgent Rankings\n";
        csvContent += "Rank,Name,Deals,Revenue,Conversion,Status\n";
        agentRanking.forEach((row, index) => {
          csvContent += `${index + 1},${row.name},${row.deals},"${row.revenue}",${row.conversion},${row.status}\n`;
        });
      } else {
        csvContent += "Marketing & Conversions\n";
        csvContent += "Lead Source,Value\n";
        sourceData.forEach(row => {
          csvContent += `${row.name},${row.value}%\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lms_report_${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track performance, revenue, and conversion metrics across your pipeline.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<FileDownload />} 
          onClick={(e) => setExportAnchorEl(e.currentTarget)}
          className="print-hide"
          sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 'none' }}
        >
          Export Report
        </Button>
        <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
          <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
          <MenuItem onClick={() => handleExport('PDF')}>Export to PDF (Print)</MenuItem>
        </Menu>
      </Box>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', mb: 4 }}>
        <Box className="print-hide" sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}>
            <Tab icon={<Assessment fontSize="small" />} iconPosition="start" label="Performance" sx={{ minHeight: 60 }} />
            <Tab icon={<MonetizationOn fontSize="small" />} iconPosition="start" label="Executive & Revenue" sx={{ minHeight: 60 }} />
            <Tab icon={<PieChartIcon fontSize="small" />} iconPosition="start" label="Marketing & Conversions" sx={{ minHeight: 60 }} />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {/* TAB 1: PERFORMANCE */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" fontWeight={700}>Lead Generation Velocity</Typography>
                <ToggleButtonGroup 
                  value={timeframe} 
                  exclusive 
                  onChange={(e, v) => v && setTimeframe(v)}
                  size="small"
                  className="print-hide"
                >
                  <ToggleButton value="daily" sx={{ px: 3, fontWeight: 600 }}>Daily</ToggleButton>
                  <ToggleButton value="weekly" sx={{ px: 3, fontWeight: 600 }}>Weekly</ToggleButton>
                  <ToggleButton value="monthly" sx={{ px: 3, fontWeight: 600 }}>Monthly</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData[timeframe] || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="leads" name="New Leads" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="won" name="Deals Won" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>

          {/* TAB 2: EXECUTIVE & REVENUE */}
          <TabPanel value={tab} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Typography variant="h6" fontWeight={700} mb={3}>Revenue Forecast vs Target</Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      <Line type="monotone" dataKey="target" name="Target Goal" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Typography variant="h6" fontWeight={700} mb={3}>Executive KPI Summary</Typography>
                <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.100', mb: 2, p: 2 }}>
                  <Typography variant="caption" color="primary.main" fontWeight={700} textTransform="uppercase">Total Revenue</Typography>
                  <Typography variant="h4" color="primary.dark" fontWeight={800} mt={1}>${(totalARR / 1000).toFixed(1)}K</Typography>
                  <Typography variant="body2" color="primary.main" mt={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp fontSize="small" /> All-time won revenue
                  </Typography>
                </Card>
                <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.100', p: 2 }}>
                  <Typography variant="caption" color="success.main" fontWeight={700} textTransform="uppercase">Overall Conversion</Typography>
                  <Typography variant="h4" color="success.dark" fontWeight={800} mt={1}>{conversionPercent}%</Typography>
                  <Typography variant="body2" color="success.main" mt={1}>{funnel.won} won out of {funnel.total} leads</Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} mb={3} mt={2}>Sales Agent Performance Ranking</Typography>
                <TableContainer variant="outlined" component={Card} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Agent Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Deals Won</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Revenue Closed</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Conversion Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {agentRanking.map((row, i) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ fontWeight: 700 }}>#{i+1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                          <TableCell>{row.deals}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>{row.revenue}</TableCell>
                          <TableCell>{row.conversion}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.status} 
                              size="small" 
                              color={row.status === 'Top Performer' ? 'success' : row.status === 'On Target' ? 'primary' : 'warning'}
                              sx={{ fontWeight: 600, borderRadius: '6px' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 3: MARKETING */}
          <TabPanel value={tab} index={2}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} mb={3}>Lead Source Distribution</Typography>
                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center' }}>
                  <PieChart width={400} height={350}>
                    <Pie
                      data={sourceData}
                      cx={200}
                      cy={175}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} mb={3}>Conversion Funnel Drop-off</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Total Leads Generated</Typography>
                      <Typography variant="body2" fontWeight={700}>{funnel.total}</Typography>
                    </Box>
                    <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 6, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: '100%', bgcolor: 'primary.main', borderRadius: 6 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Contacted & Qualified</Typography>
                      <Typography variant="body2" fontWeight={700}>{funnel.contacted}</Typography>
                    </Box>
                    <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 6, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${funnel.total > 0 ? (funnel.contacted/funnel.total)*100 : 0}%`, bgcolor: 'info.main', borderRadius: 6 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Proposal Sent</Typography>
                      <Typography variant="body2" fontWeight={700}>{funnel.proposal}</Typography>
                    </Box>
                    <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 6, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${funnel.total > 0 ? (funnel.proposal/funnel.total)*100 : 0}%`, bgcolor: 'warning.main', borderRadius: 6 }} />
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Deals Won</Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">{funnel.won}</Typography>
                    </Box>
                    <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 6, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${funnel.total > 0 ? (funnel.won/funnel.total)*100 : 0}%`, bgcolor: 'success.main', borderRadius: 6 }} />
                    </Box>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 3, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Conversion Rate (New to Won)
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight={800} mt={1}>
                    {conversionPercent}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportList;
