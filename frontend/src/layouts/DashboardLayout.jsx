import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Avatar, Menu, MenuItem, useTheme, Card, CardContent, Button,
  Popover, Badge, ListItemAvatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationsIcon,
  Stars as StarsIcon,
  Group as GroupIcon,
  AssignmentInd as AssignmentIndIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Autorenew as AutorenewIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 72;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopDrawerToggle = () => setDesktopOpen(!desktopOpen);
  
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const notifications = [];

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads', restrictedTo: ['Super Admin', 'Admin', 'Sales Head', 'Manager', 'Sales Exec'] },
    { text: 'Follow-ups', icon: <AssignmentIcon />, path: '/followups', restrictedTo: ['Super Admin', 'Admin', 'Sales Head', 'Manager', 'Sales Exec'] },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports', restrictedTo: ['Super Admin', 'Admin', 'Sales Head', 'Manager'] },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.restrictedTo) return true;
    return item.restrictedTo.includes(user?.role?.role_name);
  });

  const renderDrawerContent = (isExpanded) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', px: isExpanded ? 3 : 2.5, py: 2, justifyContent: isExpanded ? 'flex-start' : 'center' }}>
        <GroupIcon sx={{ color: 'primary.main', fontSize: 32, mr: isExpanded ? 1.5 : 0 }} />
        {isExpanded && (
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
            LMS Enterprise
          </Typography>
        )}
      </Toolbar>
      
      <List sx={{ px: isExpanded ? 2 : 1, flexGrow: 1, mt: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, display: 'block' }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: isExpanded ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: '8px',
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: active ? 'primary.main' : 'action.hover',
                    color: active ? 'primary.contrastText' : 'text.primary',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: 0,
                  mr: isExpanded ? 2 : 'auto',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ opacity: isExpanded ? 1 : 0, display: isExpanded ? 'block' : 'none' }}
                  primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: 14 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Upgrade section removed per user request */}
    </Box>
  );

  const currentDrawerWidth = desktopOpen ? drawerWidthExpanded : drawerWidthCollapsed;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <AppBar
        position="fixed"
        className="print-hide"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <IconButton color="inherit" edge="start" onClick={handleDesktopDrawerToggle}>
              <MenuIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" sx={{ mr: 2, color: 'text.secondary' }} onClick={handleNotifOpen}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 360, mt: 1.5, borderRadius: 2, boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)' } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }} disabled={notifications.length === 0}>Mark all as read</Button>
              </Box>
              <List sx={{ p: 0 }}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <ListItem key={notif.id} button divider sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notif.bgcolor, color: notif.color }}>
                          {notif.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="body2" fontWeight={600}>{notif.title}</Typography>}
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary" display="block">{notif.text}</Typography>
                            <Typography variant="caption" color="primary.main" fontWeight={600}>{notif.time}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">You have no new notifications.</Typography>
                  </Box>
                )}
              </List>
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" fullWidth sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>View All Activity</Button>
              </Box>
            </Popover>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 600, width: 36, height: 36 }}>A</Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" className="print-hide" sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 }, transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidthExpanded },
          }}
        >
          {renderDrawerContent(true)}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth, 
              borderRight: '1px solid', 
              borderColor: 'divider',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {renderDrawerContent(desktopOpen)}
        </Drawer>
      </Box>

      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, md: 4 }, 
        width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}>
        <Toolbar className="print-hide" />
        <Box sx={{ width: '100%', maxWidth: 'xl', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
