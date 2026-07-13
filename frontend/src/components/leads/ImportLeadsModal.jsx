import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Stepper, Step, StepLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { CloudUpload, Warning, CheckCircle, Description } from '@mui/icons-material';
import { toast } from 'react-toastify';

const steps = ['Upload CSV/Excel', 'Map Data & Resolve Duplicates', 'Complete Import'];

const mockPreviewData = [
  { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp', status: 'Valid' },
  { name: 'Sarah Wilson', email: 'sarah@lms.com', company: 'LMS Inc', status: 'Duplicate Email' },
  { name: 'Mike Ross', email: 'mike@pearson.com', company: 'Pearson Hardman', status: 'Valid' }
];

const ImportLeadsModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);

  const handleNext = () => {
    if (activeStep === 0 && !file) {
      toast.error('Please select a file to upload first.');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleImport = () => {
    toast.success('Successfully imported 2 leads (Skipped 1 duplicate).');
    setActiveStep(0);
    setFile(null);
    onClose();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFile({ name: 'leads_export_q3.csv', size: '24 KB' });
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); setActiveStep(0); setFile(null); }} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <CloudUpload color="primary" />
        <Typography variant="h6" fontWeight={800}>Bulk Import Leads</Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4, minHeight: 400 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            sx={{ 
              border: '2px dashed', borderColor: file ? 'success.main' : 'primary.main', 
              borderRadius: 3, p: 6, textAlign: 'center', bgcolor: file ? 'success.50' : 'primary.50',
              cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: file ? 'success.50' : '#e0e7ff' }
            }}
            onClick={() => setFile({ name: 'leads_export_q3.csv', size: '24 KB' })}
          >
            {file ? (
              <Box>
                <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="success.dark">{file.name}</Typography>
                <Typography variant="body2" color="success.main">{file.size} - Ready to process</Typography>
                <Button size="small" variant="outlined" color="success" sx={{ mt: 2 }} onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove File</Button>
              </Box>
            ) : (
              <Box>
                <CloudUpload color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="primary.dark">Drag & Drop your CSV or Excel file here</Typography>
                <Typography variant="body2" color="primary.main" mt={1}>or click to browse from your computer</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={3}>Supported formats: .csv, .xls, .xlsx (Max 10MB)</Typography>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Data Preview & Validation</Typography>
              <Chip icon={<Warning />} label="1 Duplicate Detected" color="warning" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Mapped Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mapped Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mapped Company</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Validation Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockPreviewData.map((row, i) => (
                    <TableRow key={i} sx={{ bgcolor: row.status.includes('Duplicate') ? 'warning.50' : 'inherit' }}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small" 
                          color={row.status.includes('Duplicate') ? 'warning' : 'success'} 
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.100' }}>
              <Typography variant="subtitle2" color="warning.dark" fontWeight={700}>Conflict Resolution Strategy</Typography>
              <Typography variant="body2" color="warning.dark">By default, the system will skip importing rows that have duplicate emails existing in the CRM. You can change this behavior in Pipeline Config Settings.</Typography>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" fontWeight={800} mb={1}>Ready to Import!</Typography>
            <Typography variant="body1" color="text.secondary">
              We will import <b>2 valid leads</b> and skip <b>1 duplicate lead</b>.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'grey.50' }}>
        <Button onClick={() => { onClose(); setActiveStep(0); setFile(null); }} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep > 0 && <Button onClick={handleBack} sx={{ fontWeight: 600 }}>Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} sx={{ fontWeight: 600, px: 3 }}>Next Step</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleImport} startIcon={<Description />} sx={{ fontWeight: 600, px: 3 }}>
            Confirm & Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportLeadsModal;
