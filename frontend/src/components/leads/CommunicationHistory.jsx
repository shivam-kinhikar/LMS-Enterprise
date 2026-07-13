import React from 'react';
import { Box, Typography, Avatar, Paper, Stack, Chip, Divider, IconButton } from '@mui/material';
import { Phone, Email, WhatsApp, Event, Edit, MoreVert } from '@mui/icons-material';

const historyData = [
  {
    id: 1,
    type: 'WhatsApp',
    date: 'Today, 10:30 AM',
    agent: 'Sarah Wilson',
    title: 'Sent pricing brochure',
    notes: 'Client requested the enterprise pricing PDF. Sent via WhatsApp along with a quick voice note explaining the discount tiers.',
    outcome: 'Delivered',
  },
  {
    id: 2,
    type: 'Call',
    date: 'Yesterday, 2:15 PM',
    agent: 'Michael Brown',
    title: 'Discovery Call',
    notes: 'Discussed their current pain points. They are struggling with manual lead assignment. High interest in our automation features.',
    outcome: 'Qualified',
  },
  {
    id: 3,
    type: 'Email',
    date: 'Oct 12, 2023, 09:00 AM',
    agent: 'System',
    title: 'Automated Welcome Email',
    notes: 'Subject: Welcome to LMS Enterprise! Your trial has started.',
    outcome: 'Opened',
  },
  {
    id: 4,
    type: 'Meeting',
    date: 'Oct 10, 2023, 11:00 AM',
    agent: 'David Lee',
    title: 'Initial Demo (Zoom)',
    notes: 'Gave a 30-minute walkthrough of the dashboard. Client loved the Kanban pipeline view. Action item: send proposal next week.',
    outcome: 'Completed',
  }
];

const getTypeConfig = (type) => {
  switch (type) {
    case 'WhatsApp': return { icon: <WhatsApp fontSize="small" />, color: '#fff', bg: '#25D366' };
    case 'Call': return { icon: <Phone fontSize="small" />, color: '#fff', bg: '#3B82F6' };
    case 'Email': return { icon: <Email fontSize="small" />, color: '#fff', bg: '#8B5CF6' };
    case 'Meeting': return { icon: <Event fontSize="small" />, color: '#fff', bg: '#F59E0B' };
    default: return { icon: <Edit fontSize="small" />, color: '#fff', bg: '#9CA3AF' };
  }
};

const CommunicationHistory = () => {
  return (
    <Box sx={{ position: 'relative', pl: { xs: 2, sm: 4 }, py: 2 }}>
      {/* Vertical Line */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: { xs: 35, sm: 51 }, 
          width: '2px', 
          bgcolor: 'grey.200',
          zIndex: 0 
        }} 
      />

      <Stack spacing={4}>
        {historyData.map((item, index) => {
          const config = getTypeConfig(item.type);
          
          return (
            <Box key={item.id} sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
              
              {/* Timeline Dot / Icon */}
              <Avatar 
                sx={{ 
                  bgcolor: config.bg, 
                  color: config.color, 
                  width: 40, 
                  height: 40, 
                  boxShadow: '0 0 0 4px white',
                  mt: 0.5
                }}
              >
                {config.icon}
              </Avatar>

              {/* Content Card */}
              <Paper 
                elevation={0} 
                sx={{ 
                  flexGrow: 1, 
                  p: 3, 
                  borderRadius: '12px', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.title}
                      <Chip label={item.type} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${config.bg}15`, color: config.bg }} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Logged by {item.agent} • {item.date}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={item.outcome} 
                      size="small" 
                      color={item.outcome === 'Opened' || item.outcome === 'Delivered' || item.outcome === 'Completed' || item.outcome === 'Qualified' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <IconButton size="small" sx={{ ml: -0.5, mr: -1 }}><MoreVert fontSize="small" /></IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {item.notes}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default CommunicationHistory;
