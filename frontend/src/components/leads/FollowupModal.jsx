import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Grid, Typography, IconButton, Switch, FormControlLabel, Box 
} from '@mui/material';
import { Close, NotificationsActive } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFollowup } from '../../api/followupService';
import { fetchLeads } from '../../api/leadService';
import { toast } from 'react-toastify';

const followupTypes = ['Call', 'Meeting', 'WhatsApp', 'Email', 'Visit'];
const outcomes = ['Interested', 'Not Interested', 'Left Voicemail', 'No Answer', 'Follow up Later', 'Meeting Scheduled'];

const FollowupModal = ({ open, onClose, leadName = 'Lead', leadId = null }) => {
  const [formData, setFormData] = useState({
    lead_id: leadId || '',
    date: new Date().toISOString().slice(0,16),
    type: 'Call',
    outcome: 'Left Voicemail',
    nextFollowup: '',
    notes: '',
    setReminder: true
  });

  const queryClient = useQueryClient();

  const { data: leadsResponse } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchLeads(),
    enabled: !leadId && open,
  });
  
  const leads = leadsResponse?.data?.data || leadsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => createFollowup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up logged successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to log follow-up');
    }
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    if (!formData.lead_id) {
      toast.error('Please select a lead');
      return;
    }
    const [datePart, timePart] = formData.date.split('T');
    
    createMutation.mutate({
      lead_id: formData.lead_id,
      type: formData.type,
      date: datePart,
      time: timePart,
      remarks: `${formData.outcome}: ${formData.notes}`
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Log Follow-up for {leadName}</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!leadId && (
            <Box>
              <Typography variant="body2" fontWeight={600} mb={0.5}>Select Lead *</Typography>
              <TextField 
                fullWidth select name="lead_id" 
                value={formData.lead_id} onChange={handleChange} size="small" required
              >
                {leads.map(l => <MenuItem key={l.id} value={l.id}>{l.name} - {l.company}</MenuItem>)}
                {leads.length === 0 && <MenuItem value="">No leads found</MenuItem>}
              </TextField>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} mb={0.5}>Date & Time *</Typography>
              <TextField 
                fullWidth name="date" type="datetime-local" 
                value={formData.date} onChange={handleChange} size="small" required 
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} mb={0.5}>Follow-up Type</Typography>
              <TextField fullWidth select name="type" value={formData.type} onChange={handleChange} size="small">
                {followupTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5}>Outcome</Typography>
            <TextField fullWidth select name="outcome" value={formData.outcome} onChange={handleChange} size="small">
              {outcomes.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5}>Schedule Next Follow-up (Optional)</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField 
                fullWidth name="nextFollowup" type="datetime-local" 
                value={formData.nextFollowup} onChange={handleChange} size="small" 
              />
              <FormControlLabel
                control={<Switch color="primary" name="setReminder" checked={formData.setReminder} onChange={handleChange} />}
                label={<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><NotificationsActive fontSize="small" color={formData.setReminder ? 'primary' : 'inherit'} /> Reminder</Typography>}
                sx={{ m: 0, minWidth: 120 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5}>Interaction Notes</Typography>
            <TextField 
              fullWidth name="notes" value={formData.notes} 
              onChange={handleChange} size="small" multiline rows={4} placeholder="Discussed pricing, requested a proposal..." 
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disableElevation sx={{ fontWeight: 600, borderRadius: '8px' }} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Logging...' : 'Log Activity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowupModal;
