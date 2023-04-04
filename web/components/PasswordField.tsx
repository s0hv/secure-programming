import { ComponentProps, FC, useState } from 'react';
import { Box, TextField } from '@mui/material';
import PasswordStrengthBar from 'react-password-strength-bar';


/**
 * Password textfield with options for strict requirements for length and a strength meter.
 * For strict requirements, the password must be at least 8 characters long and at most 72.
 * The strength meter uses zxcvbn to check the strength of the password, which helps users
 * to create stronger passwords and block commonly used passwords.
 */
export const PasswordField: FC<{strict?: boolean, meter?: boolean} & ComponentProps<typeof TextField>> = ({ strict = false, meter = false, ...props }) => {
  const [password, setPassword] = useState('');

  return (
    <>
      <TextField
        required
        InputLabelProps={{ required: false }}
        type='password'
        inputProps={strict ? { minLength: 8, maxLength: 72 } : {}}
        onChange={(e) => setPassword(e.target.value)}
        {...props}
      />
      {meter ? (
        <Box sx={{ ml: 1, mr: 1 }}>
          <PasswordStrengthBar password={password} minLength={8} />
        </Box>
      ) : null}
    </>
  );
};
