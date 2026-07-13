import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Add as AddIcon, Error, Today, EventNote } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchFollowups } from '../api/followupService';
import FollowupTable from '../components/followups/FollowupTable';
import FollowupModal from '../components/leads/FollowupModal';
import { CircularProgress } from '@mui/material';

const kpis = [
  { title: 'Overdue Reminders', value: '1', icon: <Error />, color: '#EF4444', bg: '#FEE2E2' },
  { title: 'Due Today', value: '2', icon: <Today />, color: '#F59E0B', bg: '#FEF3C7' },
  { title: 'Upcoming', value: '2', icon: <EventNote />, color: '#3B82F6', bg: '#DBEAFE' }
];

const FollowupList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: followupsResponse, isLoading, isError } = useQuery({
    queryKey: ['followups'],
    queryFn: () => fetchFollowups(),
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
        <Typography color="error" variant="h6">Failed to load follow-ups.</Typography>
      </Box>
    );
  }

  const rawFollowups = followupsResponse?.data || followupsResponse || [];
  
  // Compute KPIs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let overdueCount = 0;
  let dueTodayCount = 0;
  let upcomingCount = 0;

  const followups = rawFollowups.map(f => {
    const fDate = new Date(f.date);
    fDate.setHours(0, 0, 0, 0);
    const timeDiff = fDate.getTime() - today.getTime();
    
    let isOverdue = false;
    if (f.status !== 'Completed') {
      if (timeDiff < 0) {
        overdueCount++;
        isOverdue = true;
      } else if (timeDiff === 0) {
        dueTodayCount++;
      } else {
        upcomingCount++;
      }
    }

    return {
      id: f.id,
      leadName: f.lead?.name || 'Unknown Lead',
      company: f.lead?.company || 'No Company',
      type: f.type,
      status: f.status || 'Pending',
      date: `${f.date} ${f.time || ''}`.trim(),
      notes: f.remarks || '',
      isOverdue: isOverdue
    };
  });

  const kpis = [
    { title: 'Overdue Reminders', value: overdueCount.toString(), icon: <Error />, color: '#EF4444', bg: '#FEE2E2' },
    { title: 'Due Today', value: dueTodayCount.toString(), icon: <Today />, color: '#F59E0B', bg: '#FEF3C7' },
    { title: 'Upcoming', value: upcomingCount.toString(), icon: <EventNote />, color: '#3B82F6', bg: '#DBEAFE' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            Follow-up Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your reminders, calls, meetings, and WhatsApp tasks
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          disableElevation
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          onClick={() => setIsModalOpen(true)}
        >
          Log Follow-up
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, mr: 2, borderRadius: '12px', width: 56, height: 56 }}>
                  {kpi.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{kpi.title}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{kpi.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Data Table */}
      <FollowupTable followups={followups} />

      {/* Standalone Log Modal (no specific lead context) */}
      <FollowupModal open={isModalOpen} onClose={() => setIsModalOpen(false)} leadName="a Lead" />
    </Box>
  );
};

export default FollowupList;
