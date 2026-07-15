import React from 'react';
import { Box, Typography } from '@mui/material';

const CommunicationHistory = () => {
  return (
    <Box sx={{ position: 'relative', pl: { xs: 2, sm: 4 }, py: 2 }}>
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed', borderColor: 'grey.300' }}>
        <Typography variant="body1" color="text.secondary">No communication history logged for this lead yet.</Typography>
      </Box>
    </Box>
  );
};

export default CommunicationHistory;
