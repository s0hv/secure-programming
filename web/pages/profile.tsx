import Head from 'next/head';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { FC } from 'react';
import { NavBar } from '@/components/NavBar';


const PasswordChange: FC = () => {
  return <>
    <Typography
      variant='h5'
      sx={{ mb: 1 }}
    >
        Change Password
    </Typography>
    <TextField
      name='old'
      label='Old password'
      type='password'
      sx={{ mb: 1 }}
    />
    <TextField
      name='new'
      label='New password'
      type='password'
      sx={{ mb: 1 }}
    />
    <TextField
      name='repeat'
      label='Repeat new password'
      type='password'
      sx={{ mb: 1 }}
    />
    <Button variant='outlined'>Change password</Button>
  </>;
};

const AccountDeletion: FC = () => {
  return <>
    <Button variant='outlined' color='error'>Delete Account</Button>
    <Typography variant='body1'>Warning! Deleting your account is permanent.</Typography>
  </>;
};

export default function Profile() {
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <NavBar/>
      <Container
        component='main'
        maxWidth='xs'
        sx={{ textAlign: 'center' }}
      >
        <Stack spacing={20}>
          <Box
            display='flex'
            flexDirection='column'
            component='form'
          >
            <PasswordChange/>
          </Box>
          <Box flexDirection='column'>
            <AccountDeletion/>
          </Box>
        </Stack>
      </Container>
    </>
  );
}