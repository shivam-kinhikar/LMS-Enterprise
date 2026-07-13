import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar, CircularProgress } from '@mui/material';
import { Group, FiberNew, ContactPhone, CheckCircle, EmojiEvents } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../../api/dashboardService';

const statsData = [
  { id: 1, title: 'Total Leads', value: '1,284', icon: <Group />, color: '#4F46E5', bg: '#EEF2FF', growth: '↑ 12% this month' },
  { id: 2, title: 'New Leads', value: '326', icon: <FiberNew />, color: '#0EA5E9', bg: '#E0F2FE', growth: '↑ 8% this month' },
  { id: 3, title: 'Contacted', value: '842', icon: <ContactPhone />, color: '#8B5CF6', bg: '#F3E8FF', growth: '↑ 15% this month' },
  { id: 4, title: 'Qualified', value: '210', icon: <CheckCircle />, color: '#10B981', bg: '#D1FAE5', growth: '↑ 5% this month' },
  { id: 5, title: 'Won Deals', value: '84', icon: <EmojiEvents />, color: '#F59E0B', bg: '#FEF3C7', growth: '↑ 20% this month' },
];

const LeadStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  const realStats = data || {};

  const dynamicStatsData = [
    { id: 1, title: 'Total Leads', value: realStats.total_leads || 0, icon: <Group />, color: '#4F46E5', bg: '#EEF2FF', growth: 'Lifetime' },
    { id: 2, title: 'Active Followups', value: realStats.active_followups || 0, icon: <ContactPhone />, color: '#8B5CF6', bg: '#F3E8FF', growth: 'Pending Action' },
    { id: 3, title: 'Won Deals', value: realStats.won_deals || 0, icon: <CheckCircle />, color: '#10B981', bg: '#D1FAE5', growth: 'Closed Won' },
    { id: 4, title: 'Total Revenue', value: `$${Number(realStats.revenue || 0).toLocaleString()}`, icon: <EmojiEvents />, color: '#F59E0B', bg: '#FEF3C7', growth: 'Est. Value' },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {dynamicStatsData.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.id}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: stat.bg, color: stat.color, mr: 2, borderRadius: '12px' }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                {stat.growth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default LeadStats;
