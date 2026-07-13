import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Checkbox, Typography, Chip, IconButton, Menu, MenuItem, TextField, InputAdornment, Button,
  TablePagination, TableSortLabel, Stack
} from '@mui/material';
import { Search, FilterList, MoreVert, FileDownload, ViewColumn, Delete, Assignment } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, deleteLead, bulkDeleteLeads } from '../../api/leadService';
import LeadForm from './LeadForm';
import FollowupModal from './FollowupModal';
import AssignLeadModal from './AssignLeadModal';

// Removed dummy data since it is now fetched from the Laravel backend
const getStatusColor = (status) => {
  const colors = {
    'New': 'primary',
    'Attempted Contact': 'default',
    'Contacted': 'secondary',
    'Interested': 'warning',
    'Qualified': 'success',
    'Proposal Sent': 'warning',
    'Negotiation': 'info',
    'Won': 'success',
    'Lost': 'error',
    'Duplicate': 'default',
    'Spam': 'error'
  };
  return colors[status] || 'default';
};

const LeadTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', { page: page + 1, search: searchQuery }],
    queryFn: () => fetchLeads({ page: page + 1, search: searchQuery }),
    keepPreviousData: true
  });

  const leads = leadsData?.data || [];
  const totalRecords = leadsData?.total || 0;

  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [orderBy, setOrderBy] = useState('created');
  const [order, setOrder] = useState('desc');

  const [activeLeadId, setActiveLeadId] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignCount, setAssignCount] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLead(id),
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => bulkDeleteLeads(ids),
    onSuccess: () => {
      toast.success(`${selected.length} leads deleted successfully`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });

  // Handle Selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredAndSortedLeads.map((lead) => lead.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // Handle Sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter and Sort Logic (Sorting handled locally for now as data comes paginated)
  const filteredAndSortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      if (b[orderBy] < a[orderBy]) return order === 'asc' ? 1 : -1;
      if (b[orderBy] > a[orderBy]) return order === 'asc' ? -1 : 1;
      return 0;
    });
  }, [leads, order, orderBy]);

  const paginatedLeads = filteredAndSortedLeads; // Already paginated from API

  // Actions
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveLeadId(id);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveLeadId(null);
  };
  
  const handleViewDetails = () => {
    navigate(`/leads/${activeLeadId}`);
    handleMenuClose();
  };
  
  const handleEditLead = () => {
    setIsEditFormOpen(true);
    // Menu is closed after setting state to ensure the ID is captured
  };
  
  const handleAddFollowup = () => {
    setIsFollowupOpen(true);
  };
  
  const handleAssignLead = () => {
    setAssignCount(1);
    setIsAssignOpen(true);
  };

  const handleBulkAssign = () => {
    setAssignCount(selected.length);
    setIsAssignOpen(true);
  };
  
  const handleExportMenuOpen = (event) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);

  const handleExport = (format) => {
    if (filteredAndSortedLeads.length === 0) {
      toast.warning('No leads to export');
      handleExportMenuClose();
      return;
    }

    if (format === 'PDF') {
      window.print();
      toast.success('Print dialog opened for PDF export');
    } else {
      // Export as CSV (Works for Excel too)
      const headers = ['Name', 'Company', 'Email', 'Status', 'Priority', 'Assigned To', 'Follow-up Date', 'Created Date'];
      const csvRows = [headers.join(',')];

      filteredAndSortedLeads.forEach(lead => {
        const row = [
          `"${lead.name || ''}"`,
          `"${lead.company || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.status?.name || lead.status || ''}"`,
          `"${lead.priority || ''}"`,
          `"${lead.assigned_user?.name || lead.assignedTo || ''}"`,
          `"${lead.followup_date || lead.followup || ''}"`,
          `"${new Date(lead.created_at || lead.created).toLocaleDateString()}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Leads exported as ${format} successfully!`);
    }
    handleExportMenuClose();
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selected);
  };

  const handleDeleteLead = (id) => {
    deleteMutation.mutate(id);
    handleMenuClose();
  };

  return (
    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
      {/* Table Toolbar */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 2 }}>
        
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by name, company, email..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          sx={{ width: { xs: '100%', md: 350 }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
        />

        {/* Toolbar Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          
          {selected.length > 0 ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'primary.50', px: 2, py: 0.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary">{selected.length} selected</Typography>
              <Button size="small" color="primary" startIcon={<Assignment />} onClick={handleBulkAssign}>Assign</Button>
              <Button size="small" color="error" startIcon={<Delete />} onClick={handleBulkDelete}>Delete</Button>
            </Stack>
          ) : null}

          <Button 
            startIcon={<FileDownload />} 
            color="inherit" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
            onClick={handleExportMenuOpen}
          >
            Export
          </Button>
          <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportMenuClose}>
            <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}>Export as Excel</MenuItem>
            <MenuItem onClick={() => handleExport('PDF')}>Export as PDF</MenuItem>
          </Menu>

        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                  indeterminate={selected.length > 0 && selected.length < filteredAndSortedLeads.length}
                  checked={filteredAndSortedLeads.length > 0 && selected.length === filteredAndSortedLeads.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>
                  Name
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'company'} direction={orderBy === 'company' ? order : 'asc'} onClick={() => handleSort('company')}>
                  Company
                </TableSortLabel>
              </TableCell>
              
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>
                  Status
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'priority'} direction={orderBy === 'priority' ? order : 'asc'} onClick={() => handleSort('priority')}>
                  Priority
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Assigned To</TableCell>
              
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'followup'} direction={orderBy === 'followup' ? order : 'asc'} onClick={() => handleSort('followup')}>
                  Follow-up Date
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                <TableSortLabel active={orderBy === 'created'} direction={orderBy === 'created' ? order : 'asc'} onClick={() => handleSort('created')}>
                  Created Date
                </TableSortLabel>
              </TableCell>

              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLeads.length > 0 ? paginatedLeads.map((lead) => {
              const isSelected = selected.indexOf(lead.id) !== -1;
              return (
                <TableRow key={lead.id} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected} onChange={() => handleSelectOne(lead.id)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{lead.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{lead.company}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={lead.status?.name || lead.status || 'New'} 
                      size="small" 
                      color={getStatusColor(lead.status?.name || lead.status || 'New')}
                      sx={{ fontWeight: 600, borderRadius: '6px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={lead.priority === 'High' ? 'error.main' : 'text.primary'} fontWeight={lead.priority === 'High' ? 600 : 400}>
                      {lead.priority || 'Medium'}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{lead.assigned_user?.name || lead.assignedTo || 'Unassigned'}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{lead.followup_date || lead.followup || 'None'}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{new Date(lead.created_at || lead.created).toLocaleDateString()}</Typography></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, lead.id)}><MoreVert /></IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
                      <MenuItem onClick={() => { handleEditLead(); handleMenuClose(); }}>Edit Lead</MenuItem>
                      <MenuItem onClick={() => { handleAddFollowup(); handleMenuClose(); }}>Create Follow-up</MenuItem>
                      <MenuItem onClick={() => { handleAssignLead(); handleMenuClose(); }}>Assign Lead</MenuItem>
                      <MenuItem onClick={() => handleDeleteLead(lead.id)} sx={{ color: 'error.main' }}>Delete Lead</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="text.secondary">No leads found matching your search.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalRecords}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
      
      {/* Edit Form */}
      {activeLeadId && (
        <LeadForm 
          open={isEditFormOpen} 
          onClose={() => { setIsEditFormOpen(false); setActiveLeadId(null); }} 
          lead={leads.find(l => l.id === activeLeadId)} 
        />
      )}
      
      {/* Follow-up Modal */}
      {activeLeadId && (
        <FollowupModal
          open={isFollowupOpen}
          onClose={() => { setIsFollowupOpen(false); setActiveLeadId(null); }}
          leadName={leads.find(l => l.id === activeLeadId)?.name}
        />
      )}

      {/* Assign Lead Modal */}
      <AssignLeadModal 
        open={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        selectedCount={assignCount} 
      />
    </Card>
  );
};

export default LeadTable;
