import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { ConfirmProvider, useConfirm } from 'material-ui-confirm';
import { useUser } from '@/utils/useUser';
import { PasswordField } from '@/components/PasswordField';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';
import { useQueryClient } from '@tanstack/react-query';
import { handleResponse } from '@/types/api/utilities';
import { useRouter } from 'next/router';


const PasswordChange: FC = () => {
  const [repeatValid, setRepeatValid] = useState(true);
  const newPWRef = useRef<HTMLInputElement>();
  const repeatPWRef = useRef<HTMLInputElement>();
  const csrf = useCSRF();
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState({
    success: false,
    message: '',
  });
  const [sButtonDisabled, setSButtonDisabled] = useState(false);
  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    setAlert({success: alert.success, message: ''});
    setSButtonDisabled(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const body: Record<string, unknown> = {};
    formData.forEach((val, key) => {
      body[key] = val;
    });

    fetch('http://localhost:8080/api/user/changepassword', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(csrf),
      },
      body: JSON.stringify(body),
    }).then(handleResponse())
      .then(() => invalidateCsrfToken(queryClient))
      .then(() => {
        setAlert({success: true, message: 'Password changed successfully'});
        console.log('clear PW fields, notify user of password change');
      })
      .catch((e) => {
        setAlert({success: false, message: e.message});
      })
      .finally(() => {
        setSButtonDisabled(false);
      });
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
      {alert.message ? (
        <Alert
          severity={alert.success ? 'success' : 'error'}
          sx={{ margin: 'auto' }}
        >
          {alert.message}
        </Alert>
      ) : null}
      <PasswordField
        name='password'
        label='Old password'
        sx={{ mb: 1 }}
      />
      <PasswordField
        strict
        name='newPassword'
        label='New password'
        inputRef={newPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 1 }}
      />
      <PasswordField
        strict
        name='repeatPassword'
        label='Repeat new password'
        helperText={!repeatValid && 'Passwords do not match'}
        error={!repeatValid}
        inputRef={repeatPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 1 }}
      />
      <Button variant='outlined' type='submit' disabled={sButtonDisabled}>Change password</Button>
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
  const { isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect an authorized user to the landing page
  useEffect(() => {
    if (!isAuthenticated) router.push('/');
  });

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
