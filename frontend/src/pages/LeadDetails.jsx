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
import LeadForm from '../components/leads/LeadForm';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => setIsEditModalOpen(true)}>Edit Lead</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        {/* Left Side: Profile Card */}
        <Box sx={{ width: { xs: '100%', md: '340px' }, flexShrink: 0 }}>
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
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{lead.email || 'N/A'}</Typography>
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
        </Box>

        {/* Right Side: Tabbed Interface */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
              </Tabs>
            </Box>
            <Divider />
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Executive Overview</Typography>
              </Box>
              
              <Grid container spacing={2}>
                {/* Metric Cards */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}><Business /></Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Industry</Typography>
                      <Typography variant="body1" fontWeight={700} color="text.primary">{lead.industry || 'Not Specified'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}><Typography variant="h6">₹</Typography></Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Est. Value</Typography>
                      <Typography variant="body1" fontWeight={700} color="success.main">{lead.budget && !isNaN(Number(lead.budget)) ? `₹${Number(lead.budget).toLocaleString()}` : 'Not Specified'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}><History /></Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Lead Source</Typography>
                      <Typography variant="body1" fontWeight={700} color="text.primary">{lead.source?.name || 'Organic / Direct'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><Person /></Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">Product Interest</Typography>
                      <Typography variant="body1" fontWeight={700} color="text.primary">{lead.product || 'Not Specified'}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Notes Section */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>Background & Internal Notes</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: lead.notes ? 'text.secondary' : 'text.disabled', lineHeight: 1.6 }}>
                      {lead.notes || 'No background notes have been added to this lead yet.'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Tab 1: Timeline & Logs */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Communication History</Typography>
                <Button variant="contained" size="small" sx={{ borderRadius: 2 }} onClick={() => toast.info('Log Interaction feature coming soon!')}>Log Past Interaction</Button>
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

          </Card>
        </Box>
      </Box>
      
      <FollowupModal
        open={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        leadName={lead.name}
      />
      
      <LeadForm 
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lead={lead}
      />
    </Box>
  );
};

export default LeadDetails;
