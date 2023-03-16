import { FC } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { type Post as PostProps } from '@/types/api/post';

export const Post: FC<PostProps> = ({ userId, text, timestamp }) => {
  return (
    <Card sx={{ width: 500 }}>
      <CardHeader
        title={userId}
        subheader={timestamp}
      />
      <CardContent>
        <Typography variant='body2' color='inherit'>
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};
