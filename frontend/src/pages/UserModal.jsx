import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Grid, 
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRoles, createUser, updateUser } from '../api/userService';
import { toast } from 'react-toastify';

const UserModal = ({ open, onClose, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  });

  const queryClient = useQueryClient();

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });
  const roles = rolesData?.data || [];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Leave blank when editing unless changing
        role_id: user.role_id || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: roles.length > 0 ? roles[0].id : ''
      });
    }
  }, [user, roles, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => user ? updateUser(user.id, data) : createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(user ? 'User updated successfully' : 'User created successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error saving user');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || (!user && !formData.password)) {
      toast.error('Please fill in all required fields.');
      return;
    }
    saveMutation.mutate(formData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <PersonAdd color="primary" />
        <Typography variant="h6" fontWeight={800}>Invite / Edit User</Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="primary" fontWeight={700} textTransform="uppercase" mb={2}>
          User Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth name="name" label="Full Name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="email" label="Email Address" value={formData.email} onChange={handleChange} placeholder="john@company.com" size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder={user ? "Leave blank to keep current" : "Secure password"} size="small" />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>System Role</InputLabel>
              <Select 
                name="role_id"
                value={formData.role_id} 
                label="System Role" 
                onChange={handleChange}
              >
                {roles.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.role_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, px: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saveMutation.isPending} startIcon={<PersonAdd />} sx={{ fontWeight: 600, px: 3 }}>
          {saveMutation.isPending ? 'Saving...' : user ? 'Save Changes' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
