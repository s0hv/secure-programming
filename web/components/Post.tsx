import { FC } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material';
import { type Post as PostProps } from '@/types/api/post';
import { formatTimestamp } from '@/utils/utilities';
import { useUser } from '@/utils/useUser';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/constants';
import { handleResponse } from '@/types/api/utilities';


export const Post: FC<PostProps> = ({ user, text, timestamp, postId }) => {
  const { user: currentUser } = useUser();

  const csrf = useCSRF();
  const queryClient = useQueryClient();

  const deletePost = () => {
    const suffix = currentUser?.admin ? `/admin` : ``;
    fetch(`http://localhost:8080/api/posts/delete/${postId}${suffix}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader(csrf),
      },
    }).then(handleResponse())
      .then(() => invalidateCsrfToken(queryClient))
      .then(() => {
        return queryClient.invalidateQueries(QueryKeys.posts);
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

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
      <CardActions>
        {(currentUser?.userId === user.userId || currentUser?.admin) && (
          <Button
            size='small'
            color='primary'
            onClick={deletePost}
          >Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
