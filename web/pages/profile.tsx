import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import {
  FC,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ConfirmProvider, useConfirm } from 'material-ui-confirm';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { NavBar } from '@/components/NavBar';
import { useUser } from '@/utils/useUser';
import { PasswordField } from '@/components/PasswordField';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';
import { handleResponse } from '@/types/api/utilities';


/**
 * Password change form, allowing the user to change their password.
 * User is required to enter their current password to validate that the user themselves is
 * performing the action. The new password must be entered twice to prevent typos.
 * The submit button is disabled while the server is already processing the request.
 */
const PasswordChange: FC = () => {
  const [repeatValid, setRepeatValid] = useState(true);
  const PWRef = useRef<HTMLInputElement>();
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
    setAlert({ success: alert.success, message: '' });
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
        setAlert({ success: true, message: 'Password changed successfully' });
      })
      .catch((e) => {
        setAlert({ success: false, message: e.message });
      })
      .finally(() => {
        setSButtonDisabled(false);
        PWRef.current!.value = '';
        newPWRef.current!.value = '';
        repeatPWRef.current!.value = '';
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
        inputRef={PWRef}
        sx={{ mb: 2 }}
      />
      <PasswordField
        strict
        meter
        name='newPassword'
        label='New password'
        inputRef={newPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 2 }}
      />
      <PasswordField
        strict
        name='repeatPassword'
        label='Repeat new password'
        helperText={!repeatValid && 'Passwords do not match'}
        error={!repeatValid}
        inputRef={repeatPWRef}
        onBlur={validateRepeatPassword}
        sx={{ mb: 2 }}
      />
      <Button variant='outlined' type='submit' disabled={sButtonDisabled}>Change password</Button>
    </Box>
  );
};

/**
 * Account deletion procedure, which requires the user to both confirm their action by
 * typing "delete <username>" and then enter their password to validate that the user themselves is
 * performing the action.
 */
const AccountDeletion: FC = () => {
  const confirm = useConfirm();
  const { setUser, user } = useUser();
  const queryClient = useQueryClient();
  const confirmationkw = `delete ${user?.username}`;
  const csrf = useCSRF();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const confirmDelete = () => {
    confirm({
      description: `To permanently delete the account, type "${confirmationkw}" and click Proceed.`,
      confirmationKeyword: confirmationkw,
      confirmationText: 'Proceed',
    })
      .then(() => {
        setOpen(true);
      });
  };

  const submitDelete = (event: FormEvent) => {
    event.preventDefault();
    setFieldError('');

    const formData = new FormData(event.target as HTMLFormElement);
    const body: Record<string, unknown> = {};
    formData.forEach((val, key) => {
      body[key] = val;
    });

    fetch('http://localhost:8080/api/user/deleteaccount', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(csrf),
      },
      body: JSON.stringify(body),
    }).then(handleResponse())
      .then(() => setUser(null))
      .then(() => invalidateCsrfToken(queryClient))
      .then(() => {
        return router.push('/');
      })
      .catch((e) => {
        setFieldError(e.message);
      });
  };
  const handleClose = (event: SyntheticEvent) => {
    event.preventDefault();
    setOpen(false);
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
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
      >
        <DialogTitle>:(</DialogTitle>
        <DialogContent>
          <form id='deletion' onSubmit={submitDelete}>
            <PasswordField
              name='password'
              label='Password'
              helperText={fieldError}
              error={!!fieldError}
              sx={{ mt: 1 }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant='outlined'
            color='error'
            form='deletion'
            type='submit'
          >Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant='body1'>Warning! Deleting your account is permanent.</Typography>
    </>
  );
};

/**
 * Profile/account editing page.
 * Redirects to landing page if user is not authenticated.
 */
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
