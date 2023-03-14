import { FC } from 'react';
import { AppBar, Toolbar, Box, Button, Typography } from '@mui/material';


const NavBar: FC = () => {
  return (
    <Box sx={{
      flexGrow: 1,
      mb: 4
    }}
    >
      <AppBar position='static'>
        <Toolbar>
          <Typography
            variant='h6'
            component='div'
            sx={{ flexGrow: 1 }}
          >
            App name or logo here
          </Typography>
          <Button color='inherit' href='/login'>Login</Button>
          <Button color='inherit' href='/signup'>Sign up</Button>
          <Button color='inherit' href='/profile'>Profile</Button>
          <Button color='inherit' href='/index'>Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export { NavBar };