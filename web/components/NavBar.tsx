import { FC, SyntheticEvent } from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import Link from '@/components/Link';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';


/**
 * Navigation Bar of the application meant to be shown on every page.
 * Shown actions depend on whether the user is logged in or not.
 */
export const NavBar: FC = () => {
  const { isAuthenticated, user, setUser, isAdmin } = useUser();
  const csrf = useCSRF();
  const queryClient = useQueryClient();
  const router = useRouter();
  const adminSuffix = isAdmin ? ' (admin)' : '';

  const logoutUser = (event: SyntheticEvent) => {
    event.preventDefault();

    fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(csrf),
      },
    }).then(() => setUser(null))
      .then(() => invalidateCsrfToken(queryClient))
      .then(() => {
        return router.push('/');
      });
  };

  return (
    <Box sx={{
      flexGrow: 1,
      mb: 4,
    }}
    >
      <AppBar position='fixed'>
        <Toolbar>
          <Typography
            variant='h6'
            component={Link}
            href='/'
            color='inherit'
            underline='none'
          >
            App name or logo here
          </Typography>
          <Typography sx={{ flexGrow: 1 }} />
          { isAuthenticated ? (
            <>
              <Typography variant='body2' sx={{ mr: 2 }}>
                Logged in as {user?.username}{adminSuffix}
              </Typography>
              <Button color='inherit' href='/profile' component={Link}>Profile</Button>
              <Button color='inherit' onClick={logoutUser}>Logout</Button>
            </>
          ) : (
            <>
              <Button color='inherit' href='/login' component={Link}>Login</Button>
              <Button color='inherit' href='/signup' component={Link}>Sign up</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
};
