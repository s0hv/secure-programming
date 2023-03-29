import { ComponentProps, FC } from 'react';
import { TextField } from '@mui/material';

export const PasswordField: FC<{strict?: boolean} & ComponentProps<typeof TextField>> = ({ strict = false, ...props }) => {
  return (
    <TextField
      required
      InputLabelProps={{ required: false }}
      type='password'
      inputProps={strict ? { minLength: 8, maxLength: 72 } : {}}
      {...props}
    />
  );
};
