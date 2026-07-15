import React, { useState } from 'react';
import { 
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Checkbox, Typography, Chip, IconButton, Menu, MenuItem, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVert, Phone, Email, Event, WhatsApp, DirectionsWalk, 
  CheckCircle, Schedule, Error 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { updateFollowup, deleteFollowup } from '../../api/followupService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const getTypeIcon = (type) => {
  switch(type) {
    case 'Call': return <Phone fontSize="small" color="primary" />;
    case 'WhatsApp': return <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />;
    case 'Meeting': return <Event fontSize="small" color="secondary" />;
    case 'Email': return <Email fontSize="small" color="info" />;
    case 'Visit': return <DirectionsWalk fontSize="small" color="warning" />;
    default: return <Event fontSize="small" />;
  }
};

const FollowupTable = ({ followups = [] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const navigate = useNavigate();

  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setActiveId(id);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (id) => updateFollowup(id, { status: 'Completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up marked as completed!');
      handleMenuClose();
    },
    onError: () => {
      toast.error('Failed to update follow-up');
      handleMenuClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFollowup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up deleted!');
      handleMenuClose();
    },
    onError: () => {
      toast.error('Failed to delete follow-up');
      handleMenuClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateFollowup(activeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Follow-up rescheduled!');
      setRescheduleOpen(false);
      handleMenuClose();
    },
    onError: () => {
      toast.error('Failed to reschedule follow-up');
    }
  });

  const handleMarkComplete = () => {
    if (activeId) completeMutation.mutate(activeId);
  };

  const handleDelete = () => {
    if (activeId) deleteMutation.mutate(activeId);
  };

  const handleViewLead = () => {
    if (activeId) {
      const row = followups.find(f => f.id === activeId);
      if (row && row.lead_id) {
        navigate(`/leads/${row.lead_id}`);
      } else {
        toast.error('Lead ID not found');
      }
    }
    handleMenuClose();
  };

  const openReschedule = () => {
    if (activeId) {
      const row = followups.find(f => f.id === activeId);
      if (row && row.rawDate) {
        setNewDate(`${row.rawDate}T${row.rawTime || '12:00'}`);
      } else {
        setNewDate(new Date().toISOString().slice(0,16));
      }
      setRescheduleOpen(true);
    }
    handleMenuClose();
  };

  const handleRescheduleSubmit = () => {
    if (activeId && newDate) {
      const [datePart, timePart] = newDate.split('T');
      updateMutation.mutate({ date: datePart, time: timePart });
    }
  };

  return (
    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox disabled /></TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Lead</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Scheduled For</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Notes</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {followups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id} hover sx={{ bgcolor: row.isOverdue ? 'error.50' : 'inherit' }}>
                <TableCell padding="checkbox"><Checkbox /></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{row.leadName}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.company}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(row.type)}
                    <Typography variant="body2" fontWeight={600}>{row.type}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: row.isOverdue ? 'error.main' : 'text.primary' }}>
                    {row.isOverdue ? <Error fontSize="small" /> : <Schedule fontSize="small" color="action" />}
                    <Typography variant="body2" fontWeight={row.isOverdue ? 700 : 400}>{row.date}</Typography>
                  </Box>
                  {row.isOverdue && <Typography variant="caption" color="error" fontWeight={700}>Overdue</Typography>}
                </TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="body2" color="text.secondary">{row.notes}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    icon={row.status === 'Completed' ? <CheckCircle /> : <Schedule />}
                    color={row.status === 'Completed' ? 'success' : 'default'}
                    sx={{ fontWeight: 600, borderRadius: '6px' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.id)}><MoreVert /></IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleMarkComplete}>Mark as Completed</MenuItem>
                    <MenuItem onClick={openReschedule}>Reschedule</MenuItem>
                    <MenuItem onClick={handleViewLead}>View Lead</MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={followups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reschedule Follow-up</DialogTitle>
        <DialogContent dividers>
          <TextField 
            fullWidth type="datetime-local" label="New Date & Time"
            value={newDate} onChange={(e) => setNewDate(e.target.value)} 
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
          <Button onClick={handleRescheduleSubmit} variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FollowupTable;
