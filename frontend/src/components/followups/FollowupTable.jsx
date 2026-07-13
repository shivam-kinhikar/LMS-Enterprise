import React, { useState } from 'react';
import { 
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Checkbox, Typography, Chip, IconButton, Menu, MenuItem, TablePagination
} from '@mui/material';
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

  const handleMenuOpen = (e, id) => {
    setAnchorEl(e.currentTarget);
    setActiveId(id);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveId(null);
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

  const handleMarkComplete = () => {
    if (activeId) completeMutation.mutate(activeId);
  };

  const handleDelete = () => {
    if (activeId) deleteMutation.mutate(activeId);
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
                    <MenuItem onClick={handleMenuClose}>Reschedule</MenuItem>
                    <MenuItem onClick={handleMenuClose}>View Lead</MenuItem>
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
    </Card>
  );
};

export default FollowupTable;
