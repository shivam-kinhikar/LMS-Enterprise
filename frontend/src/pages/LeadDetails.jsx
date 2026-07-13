import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, 
  Tabs, Tab, Divider, Stack, IconButton 
} from '@mui/material';
import { ArrowBack, Email, Phone, Business, Person, CalendarToday, MoreVert, History } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLead } from '../api/leadService';
import FollowupModal from '../components/leads/FollowupModal';
import CommunicationHistory from '../components/leads/CommunicationHistory';
import { CircularProgress } from '@mui/material';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const { data: leadResponse, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !leadResponse) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Failed to load lead details.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/leads')}>Back to Leads</Button>
      </Box>
    );
  }

  // Handle the unwrapping from the backend which returns { success: true, data: { ... } }
  // Our interceptor unwraps the first layer, so leadResponse is { success, message, data }
  // unless the interceptor doesn't. We know dashboardService returns response.data directly.
  // Wait, leadService uses `response.data`. In axiosClient we have interceptor returning `response.data`.
  // So `leadResponse` is already the payload. The actual lead model is `leadResponse.data`? Or `leadResponse` itself?
  // Let's check: Laravel returns `response()->json(['data' => $lead])`. 
  // Interceptor returns `response.data`. So `leadResponse` here is `{ success: true, data: { id: 1, ... } }`.
  // Wait, dashboard stats we used `data || {}` because dashboardService didn't unwrap the inner data.
  // Let's safely unwrap it.
  const lead = leadResponse.data || leadResponse;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/leads')} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              {lead.name || 'Unknown Lead'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lead Profile Details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Convert to Client</Button>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>Edit Lead</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Profile Card */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto', mb: 2 }}>
                  {lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{lead.name}</Typography>
                <Typography variant="body2" color="text.secondary">{lead.company || 'No Company'}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Status & Priority</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={lead.status?.name || lead.status || 'New'} size="small" color="primary" sx={{ fontWeight: 600, borderRadius: '6px' }} />
                    <Chip label={lead.priority || 'Medium'} size="small" color="error" variant="outlined" sx={{ fontWeight: 600, borderRadius: '6px' }} />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Contact Info</Typography>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{lead.email || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{lead.phone || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2">{lead.company || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Assignment</Typography>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">{lead.assigned_user?.name || lead.assignedTo || 'Unassigned'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">Follow-up: {lead.followup_date || lead.followupDate || 'None'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {(lead.tags || []).map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ borderRadius: '6px', bgcolor: 'grey.100' }} />
                    ))}
                    {(!lead.tags || lead.tags.length === 0) && (
                      <Typography variant="caption" color="text.secondary">No tags</Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Tabbed Interface */}
        <Grid item xs={12} md={8} lg={9}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' } }}
              >
                <Tab label="Overview" />
                <Tab icon={<History />} iconPosition="start" label="Timeline & Logs" sx={{ minHeight: 64 }} />
                <Tab icon={<CalendarToday />} iconPosition="start" label="Follow-ups" sx={{ minHeight: 64 }} />
                <Tab icon={<Person />} iconPosition="start" label="Notes" sx={{ minHeight: 64 }} />
                <Tab icon={<Business />} iconPosition="start" label="Documents" sx={{ minHeight: 64 }} />
              </Tabs>
            </Box>
            <Divider />
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" sx={{ mb: 2 }}>Lead Overview</Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed overview module coming soon. Will display aggregate stats, custom fields, and summary data for this lead.
              </Typography>
            </TabPanel>
            
            {/* Tab 1: Timeline & Logs */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Communication History</Typography>
                <Button variant="contained" size="small" sx={{ borderRadius: 2 }} onClick={() => setIsFollowupModalOpen(true)}>Log Past Interaction</Button>
              </Box>
              <CommunicationHistory />
            </TabPanel>
            
            {/* Tab 2: Follow-ups */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Upcoming Follow-ups</Typography>
                <Button variant="contained" size="small" sx={{ borderRadius: 2 }} onClick={() => setIsFollowupModalOpen(true)}>+ Add Follow-up</Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                No active follow-ups. Schedule a call, meeting, or email.
              </Typography>
            </TabPanel>

            {/* Tab 3: Notes */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="body2" color="text.secondary">Notes module coming soon.</Typography>
            </TabPanel>

            {/* Tab 4: Documents */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="body2" color="text.secondary">Drag and drop business cards, proposals, or contracts here.</Typography>
            </TabPanel>

          </Card>
        </Grid>
      </Grid>
      
      <FollowupModal
        open={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        leadName={lead.name}
      />
    </Box>
  );
};

export default LeadDetails;
