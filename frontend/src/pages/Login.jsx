import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      const response = await login(data.email, data.password);
      if (response && response.success) {
        navigate('/dashboard');
      } else {
        setError(response?.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed. Please try again.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      backgroundImage: 'radial-gradient(at 50% 50%, hsla(228, 100%, 74%, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.1) 0px, transparent 50%)'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          p: 5,
          borderRadius: 4,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.05em' }}>
              LMS Enterprise
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600, mb: 2 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Typography variant="body2" align="center" color="text.secondary">
              Default demo credentials:<br />
              <b>admin@example.com</b> / <b>password</b>
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
