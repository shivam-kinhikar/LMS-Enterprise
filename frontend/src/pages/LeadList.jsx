import React, { useState } from 'react';
import { Box, Typography, Button, Stack, ToggleButton, ToggleButtonGroup, Menu, MenuItem } from '@mui/material';
import { Add as AddIcon, CloudUpload, FileDownload, ViewList, ViewKanban, PictureAsPdf, GridOn } from '@mui/icons-material';
import { toast } from 'react-toastify';
import LeadStats from '../components/leads/LeadStats';
import LeadTable from '../components/leads/LeadTable';
import LeadPipeline from '../components/leads/LeadPipeline';
import LeadForm from '../components/leads/LeadForm';
import ImportLeadsModal from '../components/leads/ImportLeadsModal';

const LeadList = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportAnchor, setExportAnchor] = useState(null);

  const handleExport = async (format) => {
    try {
      if (format === 'PDF') {
        window.print();
        toast.success('Print dialog opened for PDF export');
      } else {
        // Fetch all leads for top-level export
        const response = await fetch('http://localhost:8000/api/leads');
        const data = await response.json();
        const leads = data.data || [];
        
        if (leads.length === 0) {
          toast.warning('No leads to export');
          setExportAnchor(null);
          return;
        }

        const headers = ['Name', 'Company', 'Email', 'Status', 'Priority', 'Assigned To', 'Follow-up Date', 'Created Date'];
        const csvRows = [headers.join(',')];

        leads.forEach(lead => {
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
        a.download = `all_leads_export_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`All leads exported as ${format} successfully!`);
      }
    } catch (err) {
      toast.error('Failed to export data');
    }
    setExportAnchor(null);
  };

  return (
    <Box>
      {/* STEP 1: Improved Lead Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            Lead Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage, track and convert your business opportunities
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />} 
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            onClick={(e) => setExportAnchor(e.currentTarget)}
          >
            Export
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={() => handleExport('CSV')}><GridOn fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> Export to CSV</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}><GridOn fontSize="small" sx={{ mr: 1, color: 'success.dark' }} /> Export to Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExport('PDF')}><PictureAsPdf fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> Export to PDF</MenuItem>
          </Menu>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disableElevation
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            onClick={() => setIsFormOpen(true)}
          >
            Add New Lead
          </Button>
        </Stack>
      </Box>

      {/* STEP 2: Lead Statistics Cards */}
      <LeadStats />

      {/* STEP 3, 4, 5 & 9: Views */}
      <LeadTable />

      {/* STEP 6: Add/Edit Lead Form */}
      <LeadForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />
      
      {/* Import Modal */}
      <ImportLeadsModal open={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </Box>
  );
};

export default LeadList;
