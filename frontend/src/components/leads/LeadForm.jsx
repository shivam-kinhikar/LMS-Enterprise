import React, { useState } from 'react';
import { 
  Drawer, Box, Typography, IconButton, Divider, TextField, 
  Grid, MenuItem, Button, Chip, Stack 
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLead, updateLead } from '../../api/leadService';
import { toast } from 'react-toastify';

const sources = ['Website', 'LinkedIn', 'Referral', 'Campaign', 'Direct', 'Other'];
const statuses = ['New', 'Attempted Contact', 'Contacted', 'Interested', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Duplicate', 'Spam'];
const priorities = ['Low', 'Medium', 'High'];

const LeadForm = ({ open, onClose, lead = null }) => {
  const isEdit = Boolean(lead);
  
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    address: lead?.address || '',
    industry: lead?.industry || '',
    source: lead?.source || 'Website',
    campaign: lead?.campaign || '',
    product: lead?.product || '',
    budget: lead?.budget || '',
    priority: lead?.priority || 'Medium',
    status: lead?.status || 'New',
    assignedTo: lead?.assignedTo || '',
    followup: lead?.followup || '',
    notes: lead?.notes || '',
    tags: lead?.tags || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => {
      return isEdit ? updateLead(lead.id, data) : createLead(data);
    },
    onSuccess: () => {
      toast.success(`Lead ${isEdit ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['lead', String(lead.id)] });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Error saving lead. Please try again.');
    }
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600 } } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Lead' : 'Add New Lead'}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          Contact Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} size="small" required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} size="small" required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} size="small" multiline rows={2} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          Lead Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label="Lead Source" name="source" value={formData.source} onChange={handleChange} size="small">
              {sources.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label="Status" name="status" value={formData.status} onChange={handleChange} size="small">
              {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label="Priority" name="priority" value={formData.priority} onChange={handleChange} size="small">
              {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Industry" name="industry" value={formData.industry} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Product of Interest" name="product" value={formData.product} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Budget" name="budget" value={formData.budget} onChange={handleChange} size="small" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          Assignment & Follow-up
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth select label="Assigned To" name="assignedTo" value={formData.assignedTo} onChange={handleChange} size="small">
              <MenuItem value="Auto-distribution"><em>Auto-distribution (Round Robin)</em></MenuItem>
              <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 800, mt: 1, color: 'text.primary' }}>Departments</MenuItem>
              {['Enterprise Sales', 'SMB Sales', 'Marketing'].map(d => <MenuItem key={d} value={d} sx={{ pl: 4 }}>{d}</MenuItem>)}
              <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 800, mt: 1, color: 'text.primary' }}>Agents</MenuItem>
              {['Alex Johnson', 'Sarah Connor', 'Michael Smith'].map(u => <MenuItem key={u} value={u} sx={{ pl: 4 }}>{u}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Follow-up Date" name="followup" type="date" value={formData.followup} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Internal Notes" name="notes" value={formData.notes} onChange={handleChange} size="small" multiline rows={3} />
          </Grid>
        </Grid>

      </Box>

      <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'background.paper' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }} disabled={mutation.isPending}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Lead')}
        </Button>
      </Box>
    </Drawer>
  );
};

export default LeadForm;
