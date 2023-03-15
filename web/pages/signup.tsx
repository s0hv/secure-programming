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

const SignUpForm: FC = () => {
  return (
    <>
      <Typography
        variant='h4'
        sx={{ mb: 2 }}
      >
        Sign up
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
      <TextField
        name='email'
        label='Email'
        sx={{ mb: 1 }}
      />
      <Button variant='contained'>Sign up</Button>

    </>
  );
};
export default function Signup() {
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
        <Box
          display='flex'
          flexDirection='column'
          component='form'
          sx={{
            mb: 2,
          }}
        >
          <SignUpForm />
        </Box>
        <Box flexDirection='row' component='form'>
          <Link href='/login'>Already have an account?</Link>
        </Box>
      </Container>
    </>
  );
}
