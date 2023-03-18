import { FC } from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useUser } from '@/utils/useUser';
import Link from '@/components/Link';


export const NavBar: FC = () => {
  const { isAuthenticated } = useUser();

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
            sx={{ flexGrow: 1 }}
          >
            App name or logo here
          </Typography>
          { isAuthenticated ? (
            <>
              <Button color='inherit' href='/profile' component={Link}>Profile</Button>
              <Button color='inherit' href='/' component={Link}>Logout</Button>
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

