import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { FC, FormEvent, useRef, useState } from 'react';
import { NavBar } from '@/components/NavBar';

const LoginForm: FC = () => {
  const PWRef = useRef<HTMLInputElement>();
  const [alert, setAlert] = useState(false);
  const loginUser = (event: FormEvent) => {
    event.preventDefault();
    console.log('Validate PW, authenticate, on success take to landing page,' +
      ' else clear password, give error message');
    if (PWRef.current) {
      PWRef.current.value = '';
    }
    setAlert(true);
  };

  return (
    <Box
      display='flex'
      flexDirection='column'
      component='form'
      onSubmit={loginUser}
      sx={{
        mb: 2,
      }}
    >
      <Typography
        variant='h4'
        sx={{ mb: 2 }}
      >
        Log in
      </Typography>
      {alert ? (
        <Alert
          severity='error'
          sx={{ margin: 'auto' }}
        >
          Login failed; Invalid username or password.
        </Alert>
      ) : null}
      <TextField
        name='username'
        label='Username'
        sx={{ mb: 2 }}
      />
      <TextField
        name='password'
        type='password'
        label='Password'
        inputRef={PWRef}
        sx={{ mb: 2 }}
      />
      <Button variant='contained' type='submit'>Log in</Button>
    </Box>
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
        <LoginForm />
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
