import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Typography, IconButton, 
  Tabs, Tab, Box, Alert
} from '@mui/material';
import { Close, Person, Business, Loop } from '@mui/icons-material';

const dummyUsers = ['Alex Johnson (Sales Rep)', 'Sarah Connor (Senior AE)', 'Michael Smith (SDR)'];
const dummyDepartments = ['Enterprise Sales', 'SMB Sales', 'International Team', 'Marketing Qualified'];

const AssignLeadModal = ({ open, onClose, selectedCount = 1 }) => {
  const [tab, setTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const handleSave = () => {
    const method = tab === 0 ? 'Manual' : tab === 1 ? 'Department' : 'Round Robin';
    const target = tab === 0 ? selectedUser : tab === 1 ? selectedDept : 'Auto-distribution';
    console.log(`Assigning ${selectedCount} lead(s) via ${method} to ${target}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Assign {selectedCount > 1 ? `${selectedCount} Leads` : 'Lead'}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
          <Tab icon={<Person fontSize="small" />} iconPosition="start" label="Manual" sx={{ minHeight: 48, fontWeight: 600 }} />
          <Tab icon={<Business fontSize="small" />} iconPosition="start" label="Department" sx={{ minHeight: 48, fontWeight: 600 }} />
          <Tab icon={<Loop fontSize="small" />} iconPosition="start" label="Round Robin" sx={{ minHeight: 48, fontWeight: 600 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 180 }}>
        {tab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Directly assign {selectedCount > 1 ? 'these leads' : 'this lead'} to a specific team member.
            </Typography>
            <TextField fullWidth select label="Select User" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} size="small">
              {dummyUsers.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
          </Box>
        )}
        
        {tab === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Route {selectedCount > 1 ? 'these leads' : 'this lead'} to a department queue for managers to distribute.
            </Typography>
            <TextField fullWidth select label="Select Department" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} size="small">
              {dummyDepartments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <strong>Round Robin Engine Active.</strong><br/>
              {selectedCount > 1 
                ? `The ${selectedCount} selected leads will be evenly distributed among available online agents.` 
                : 'This lead will be automatically assigned to the next available agent in the rotation.'}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Configure your Round Robin groups and agent weights in the Settings module.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disableElevation 
          sx={{ fontWeight: 600, borderRadius: '8px' }}
          disabled={(tab === 0 && !selectedUser) || (tab === 1 && !selectedDept)}
        >
          Confirm Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignLeadModal;
