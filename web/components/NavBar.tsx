import { FC } from 'react';
import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material';
import { useUser } from '@/utils/useUser';


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
              <Button color='inherit' href='/profile'>Profile</Button>
              <Button color='inherit' href='/'>Logout</Button>
            </>
          ) : (
            <>
              <Button color='inherit' href='/login'>Login</Button>
              <Button color='inherit' href='/signup'>Sign up</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
};

