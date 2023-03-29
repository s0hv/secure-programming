import Head from 'next/head';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { FC, FormEvent, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import Link from '@/components/Link';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';
import { handleResponse } from '@/types/api/utilities';
import { FrontendUser } from '@/types/api/user';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import { PasswordField } from '@/components/PasswordField';

const SignUpForm: FC = () => {
  const [alert, setAlert] = useState('');
  const csrf = useCSRF();
  const queryClient = useQueryClient();
  const { setUser, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  const signUpUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const body: Record<string, unknown> = {};
    formData.forEach((val, key) => {
      body[key] = val;
    });

    fetch('http://localhost:8080/api/user/createaccount', {
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
        console.log('account created succesfully');
        setAlert('');
        return router.push('/');
      })
      .catch((e) => {
        console.log(`account creation failed ${e}`);
        setAlert(e.message);
      });
  };

  return (
    <Box
      display='flex'
      flexDirection='column'
      component='form'
      onSubmit={signUpUser}
      sx={{
        mb: 2,
      }}
    >
      <Typography
        variant='h4'
        sx={{ mb: 2 }}
      >
        Sign up
      </Typography>
      {alert ? (
        <Alert
          severity='error'
          sx={{ margin: 'auto' }}
        >
          Sign up failed; {alert}
        </Alert>
      ) : null}
      <TextField
        required
        InputLabelProps={{ required: false }}
        name='username'
        label='Username'
        inputProps={{ maxLength: 32 }}
        sx={{ mb: 2 }}
      />
      <PasswordField
        strict
        name='password'
        label='Password'
        sx={{ mb: 2 }}
      />
      <TextField
        required
        InputLabelProps={{ required: false }}
        name='email'
        label='Email'
        type='email'
        sx={{ mb: 2 }}
      />
      <Button variant='contained' type='submit' disabled={isLoading || isAuthenticated}>Sign up</Button>

    </Box>
  );
};
export default function Signup() {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect an already logged-in user to the landing page
  useEffect(() => {
    if (isAuthenticated) router.push('/');
  });

  return (
    <>
      <Head>
        <title>Sign up for App</title>
      </Head>
      <NavBar />
      <Container
        component='main'
        maxWidth='xs'
        sx={{ textAlign: 'center' }}
      >
        <SignUpForm />
        <Box flexDirection='row' component='form'>
          <Link href='/login'>Already have an account?</Link>
        </Box>
      </Container>
    </>
  );
}
