import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { NavBar } from '@/components/NavBar';
import { handleResponse } from '@/types/api/utilities';
import type { FrontendUser } from '@/types/api/user';
import { useUser } from '@/utils/useUser';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';
import Link from '@/components/Link';
import { PasswordField } from '@/components/PasswordField';

const LoginForm: FC = () => {
  const PWRef = useRef<HTMLInputElement>();
  const [alert, setAlert] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, isLoading, isAuthenticated } = useUser();
  const csrf = useCSRF();

  const loginUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const body: Record<string, unknown> = {};
    formData.forEach((val, key) => {
      body[key] = val;
    });

    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(csrf),
      },
      body: JSON.stringify(body),
    }).then(handleResponse<FrontendUser>())
      .then(setUser)
      .then(() => invalidateCsrfToken(queryClient))
      .then(() => {
        setAlert(false);
        return router.push('/');
      })
      .catch((e) => {
        console.log(e);
        if (PWRef.current) {
          PWRef.current.value = '';
        }
        setAlert(true);
      });
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
          Login failed; Invalid email or password.
        </Alert>
      ) : null}
      <TextField
        required
        InputLabelProps={{ required: false }}
        name='email'
        label='Email'
        sx={{ mb: 2 }}
      />
      <PasswordField
        name='password'
        label='Password'
        inputRef={PWRef}
        sx={{ mb: 2 }}
      />
      <Button variant='contained' type='submit' disabled={isLoading || isAuthenticated}>Log in</Button>
    </Box>
  );
};

export default function Login() {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect an already logged-in user to the landing page
  useEffect(() => {
    if (isAuthenticated) router.push('/');
  });

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
