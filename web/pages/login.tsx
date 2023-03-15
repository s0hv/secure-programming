import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography
} from '@mui/material';
import { FC } from 'react';
import { NavBar } from '@/components/NavBar';

const LoginForm: FC = () => {
  return (
    <>
      <Typography
        variant='h4'
        sx={{ mb: 2 }}
      >
        Log in
      </Typography>
      <TextField
        name='username'
        label='Username'
        sx={{ mb: 1 }}
      />
      <TextField
        name='password'
        type='password'
        label='Password'
        sx={{ mb: 1 }}
      />
      <Button variant='contained'>Log in</Button>
    </>
  );
};

export default function Login() {
  return (
    <>
      <Head>
        <title>Log into App</title>
      </Head>
      <NavBar />
      <Container
        component='main'
        maxWidth='xs'
        sx={{ textAlign: 'center' }}
      >
        <Box
          display='flex'
          flexDirection='column'
          component='form'
          sx={{
            mb: 2,
          }}
        >
          <LoginForm />
        </Box>
        <Box flexDirection='row' component='form'>
          <Link
            href='#.'
            sx={{
              mr: 2,
            }}
          >
            Forgot password?
          </Link>
          <Link href='/signup'>Sign up instead</Link>
        </Box>
      </Container>
    </>
  );
}
