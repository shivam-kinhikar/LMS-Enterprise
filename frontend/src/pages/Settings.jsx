import React, { useState, useContext, useRef } from 'react';
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
import { fetchUsers, deleteUser, updateUser, uploadUserAvatar } from '../api/userService';
import { AuthContext } from '../context/AuthContext';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ flexGrow: 1, paddingLeft: '24px' }}>
    {value === index && <Box>{children}</Box>}
  </div>
);



const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const fileInputRef = useRef(null);

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

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return uploadUserAvatar(user.id, formData);
    },
    onSuccess: (data) => {
      toast.success('Avatar updated successfully!');
      setUser(data.data);
    },
    onError: () => toast.error('Failed to upload avatar.')
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
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
            {user?.role?.role_name === 'Super Admin' && (
              <Tab icon={<Group fontSize="small" />} iconPosition="start" label="Team & Roles" />
            )}
          </Tabs>
        </Box>

        {/* Right Side: Tab Content */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          
          {/* TAB 0: PROFILE */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" fontWeight={700} mb={3}>Personal Information</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={user?.avatar ? `http://localhost:8000${user.avatar}` : ''}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
                >
                  {!user?.avatar && (user?.name?.[0]?.toUpperCase() || 'U')}
                </Avatar>
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<CloudUpload />} 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Change Photo'}
                </Button>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Full Name" defaultValue={user?.name || ''} size="small" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address" defaultValue={user?.email || ''} size="small" disabled />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
              <Button variant="contained" onClick={handleSave}>Save Changes</Button>
            </Box>
          </TabPanel>

          {/* TAB 1: TEAM & ROLES */}
          {user?.role?.role_name === 'Super Admin' && (
            <TabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>User Management</Typography>
              {user?.role?.role_name === 'Super Admin' && (
                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingUser(null); setUserModalOpen(true); }}>Invite User</Button>
              )}
            </Box>
            <TableContainer variant="outlined" component={Card} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    {user?.role?.role_name === 'Super Admin' && (
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((rowUser) => (
                    <TableRow key={rowUser.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{rowUser.name}</TableCell>
                      <TableCell>{rowUser.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rowUser.role?.role_name || 'User'} 
                          size="small" 
                          variant="outlined"
                          color={(rowUser.role?.role_name || 'User') === 'Admin' ? 'primary' : 'default'}
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel 
                          control={
                            <Switch 
                              size="small" 
                              checked={Boolean(rowUser.status)} 
                              onChange={(e) => toggleStatusMutation.mutate({ id: rowUser.id, status: e.target.checked })} 
                              color="success" 
                              disabled={user?.role?.role_name !== 'Super Admin'}
                            />
                          } 
                          label={<Typography variant="body2" fontWeight={600} color={rowUser.status ? 'success.main' : 'text.secondary'}>{rowUser.status ? 'Active' : 'Inactive'}</Typography>} 
                        />
                      </TableCell>
                      {user?.role?.role_name === 'Super Admin' && (
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => { setEditingUser(rowUser); setUserModalOpen(true); }}><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(rowUser.id)} disabled={deleteMutation.isPending}><Delete fontSize="small" /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} user={editingUser} />
          </TabPanel>
          )}



        </Box>
      </Card>
    </Box>
  );
};

export default Settings;
