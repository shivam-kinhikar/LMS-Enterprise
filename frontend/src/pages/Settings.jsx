import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, 
  Button, TextField, Avatar, Divider, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Stack
} from '@mui/material';
import { 
  Person, Group, Tune, Notifications, Edit, Delete, Add, VpnKey, CloudUpload
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserModal from './UserModal';
import { fetchUsers, deleteUser, updateUser } from '../api/userService';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ flexGrow: 1, paddingLeft: '24px' }}>
    {value === index && <Box>{children}</Box>}
  </div>
);



const Settings = () => {
  const [tab, setTab] = useState(0);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const users = usersData || [];

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User removed.');
    },
    onError: () => toast.error('Failed to remove user.')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUser(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated.');
    },
    onError: () => toast.error('Failed to update status.')
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    toast.success('Settings updated successfully!');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Platform Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account, team permissions, and CRM configuration.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', display: 'flex', minHeight: 600 }}>
        
        {/* Left Side: Vertical Tabs */}
        <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 220, bgcolor: 'grey.50' }}>
          <Tabs 
            orientation="vertical" 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
            sx={{ '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', fontWeight: 600, textTransform: 'none', minHeight: 56 } }}
          >
            <Tab icon={<Person fontSize="small" />} iconPosition="start" label="My Profile" />
            <Tab icon={<Group fontSize="small" />} iconPosition="start" label="Team & Roles" />
          </Tabs>
        </Box>

        {/* Right Side: Tab Content */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          
          {/* TAB 0: PROFILE */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" fontWeight={700} mb={3}>Personal Information</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}>A</Avatar>
                <Button variant="outlined" size="small" startIcon={<CloudUpload />}>Change Photo</Button>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Full Name" defaultValue="Admin User" size="small" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address" defaultValue="admin@lms.com" size="small" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
              <Button variant="contained" onClick={handleSave}>Save Changes</Button>
            </Box>
          </TabPanel>

          {/* TAB 1: TEAM & ROLES */}
          <TabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>User Management</Typography>
              <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingUser(null); setUserModalOpen(true); }}>Invite User</Button>
            </Box>
            <TableContainer variant="outlined" component={Card} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role?.role_name || 'User'} 
                          size="small" 
                          variant="outlined"
                          color={(user.role?.role_name || 'User') === 'Admin' ? 'primary' : 'default'}
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel 
                          control={
                            <Switch 
                              size="small" 
                              checked={Boolean(user.status)} 
                              onChange={(e) => toggleStatusMutation.mutate({ id: user.id, status: e.target.checked })} 
                              color="success" 
                            />
                          } 
                          label={<Typography variant="body2" fontWeight={600} color={user.status ? 'success.main' : 'text.secondary'}>{user.status ? 'Active' : 'Inactive'}</Typography>} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => { setEditingUser(user); setUserModalOpen(true); }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)} disabled={deleteMutation.isPending}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} user={editingUser} />
          </TabPanel>



        </Box>
      </Card>
    </Box>
  );
};

export default Settings;
