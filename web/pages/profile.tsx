import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, FormEvent, useRef, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { ConfirmProvider, useConfirm } from 'material-ui-confirm';
import { useUser } from '@/utils/useUser';


const PasswordChange: FC = () => {
  const [repeatValid, setRepeatValid] = useState(true);
  const newPWRef = useRef<HTMLInputElement>();
  const repeatPWRef = useRef<HTMLInputElement>();
  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    console.log('Validate old and new PW on backend and change');
  };

  const validateRepeatPassword = () => {
    setRepeatValid(!repeatPWRef.current?.value || newPWRef.current?.value === repeatPWRef.current?.value);
  };
  return (
    <Box
      display='flex'
      flexDirection='column'
      component='form'
      onSubmit={changePassword}
    >
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
        inputRef={newPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 1 }}
      />
      <TextField
        name='repeat'
        label='Repeat new password'
        type='password'
        helperText={!repeatValid && 'Passwords do not match'}
        error={!repeatValid}
        inputRef={repeatPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 1 }}
      />
      <Button variant='outlined' type='submit'>Change password</Button>
    </Box>
  );
};

const AccountDeletion: FC = () => {
  const confirm = useConfirm();
  const { user } = useUser();
  const confirmationkw = `delete ${user}`;
  const confirmDelete = () => {
    confirm({
      description: `To permanently delete the account, type "${confirmationkw}" and click Delete`,
      confirmationKeyword: confirmationkw,
      confirmationText: 'Delete',
    })
      .then(() => {
        console.log('Handle delete on backend, then go to landing page');
      }).catch(() => {
        /* ... */
      });
  };

  return (
    <>
      <Button
        variant='outlined'
        color='error'
        onClick={confirmDelete}
      >
        Delete Account
      </Button>
      <Typography variant='body1'>Warning! Deleting your account is permanent.</Typography>
    </>
  );
};

export default function Profile() {
  return (
    <ConfirmProvider>
      <Head>
        <title>Profile</title>
      </Head>
      <NavBar />
      <Container
        component='main'
        maxWidth='xs'
        sx={{ textAlign: 'center' }}
      >
        <Stack spacing={20}>
          <PasswordChange />
          <Box flexDirection='column'>
            <AccountDeletion />
          </Box>
        </Stack>
      </Container>
    </ConfirmProvider>
  );
}
