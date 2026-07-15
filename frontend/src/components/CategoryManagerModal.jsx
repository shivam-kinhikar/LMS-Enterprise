import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  List, ListItem, ListItemText, IconButton, TextField, Box, 
  Typography, CircularProgress, Divider
} from '@mui/material';
import { Delete, Edit, Add, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeadSources, createLeadSource, updateLeadSource, deleteLeadSource } from '../api/leadSourceService';
import { toast } from 'react-toastify';

const CategoryManagerModal = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['leadSources'],
    queryFn: fetchLeadSources,
    enabled: open
  });

  const createMutation = useMutation({
    mutationFn: createLeadSource,
    onSuccess: () => {
      queryClient.invalidateQueries(['leadSources']);
      queryClient.invalidateQueries(['dashboardStats']);
      setNewCategoryName('');
      toast.success('Category added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateLeadSource,
    onSuccess: () => {
      queryClient.invalidateQueries(['leadSources']);
      queryClient.invalidateQueries(['dashboardStats']);
      setEditingId(null);
      setEditingName('');
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeadSource,
    onSuccess: () => {
      queryClient.invalidateQueries(['leadSources']);
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category. It might be in use.');
    }
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createMutation.mutate({ name: newCategoryName.trim() });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    updateMutation.mutate({ id: editingId, data: { name: editingName.trim() } });
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={800} color="#111827">Manage Lead Sources</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#9ca3af' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField 
            fullWidth 
            size="small" 
            placeholder="New Category Name" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={createMutation.isPending}
            InputProps={{ sx: { borderRadius: '8px' } }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Add />}
            disabled={createMutation.isPending || !newCategoryName.trim()}
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, bgcolor: '#5b45f1', '&:hover': { bgcolor: '#4c3ae0' } }}
          >
            Add
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {categories.map((cat) => (
              <ListItem 
                key={cat.id} 
                sx={{ 
                  bgcolor: '#f8fafc', 
                  mb: 1, 
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9'
                }}
                secondaryAction={
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => startEdit(cat)} disabled={editingId === cat.id}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                        if(window.confirm('Are you sure you want to delete this category?')) {
                            deleteMutation.mutate(cat.id);
                        }
                    }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                {editingId === cat.id ? (
                  <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', width: '100%', pr: 8, gap: 1 }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)} 
                      autoFocus
                    />
                    <Button type="submit" size="small" variant="contained" disabled={updateMutation.isPending}>Save</Button>
                    <Button onClick={() => setEditingId(null)} size="small" variant="outlined" color="inherit">Cancel</Button>
                  </Box>
                ) : (
                  <ListItemText primary={<Typography variant="body2" fontWeight={600} color="#334155">{cat.name}</Typography>} />
                )}
              </ListItem>
            ))}
            {categories.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No categories found. Add one above.
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagerModal;
