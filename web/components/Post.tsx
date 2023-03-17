import { FC } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { type Post as PostProps } from '@/types/api/post';
import { formatTimestamp } from '@/utils/utilities';


export const Post: FC<PostProps> = ({ user, text, timestamp }) => {
  return (
    <Card sx={{ width: 500 }}>
      <CardHeader
        title={user.username}
        subheader={formatTimestamp(timestamp)}
      />
      <CardContent>
        <Typography variant='body2' color='inherit'>
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};
