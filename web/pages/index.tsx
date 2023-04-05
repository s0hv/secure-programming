import Head from 'next/head';
import { FC, SyntheticEvent, useRef, useState } from 'react';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NavBar } from '@/components/NavBar';
import { Post } from '@/components/Post';
import { type Post as PostProps } from '@/types/api/post';
import { useUser } from '@/utils/useUser';
import { handleResponse } from '@/types/api/utilities';
import { appPath, QueryKeys } from '@/utils/constants';
import { csrfHeader, invalidateCsrfToken, useCSRF } from '@/utils/useCsrf';


/**
 * List of posts which are retrieved from the server and displayed.
 */
const Posts: FC = () => {
  const { data: posts, isFetching } = useQuery<PostProps[]>({
    queryKey: QueryKeys.posts,
    initialData: [],
    queryFn: () => fetch(`${appPath}/api/posts`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(handleResponse<PostProps[]>('posts')),
  });

  return (
    <Container
      component='main'
      maxWidth='xs'
      sx={{
        mb: 5,
      }}
    >
      <Typography
        variant='h5'
        align='center'
        sx={{ mb: 2 }}
      >
        Latest posts
      </Typography>
      <Stack
        direction='column'
        justifyContent='space-evenly'
        alignItems='center'
        spacing={4}
      >
        { isFetching ? (
          new Array(10).fill(1).map((_, idx) => (
            <Skeleton
              key={idx /* eslint-disable-line react/no-array-index-key */}
              variant='rectangular'
              width={500}
              height={190}
            />
          ))) : (
          posts.map((el) => <Post key={el.postId} {...el} />))}
      </Stack>
    </Container>
  );
};

/**
 * Button which initiates creating a post.
 */
const NewPostButton: FC = () => {
  const [open, setOpen] = useState(false);
  const [postValid, setPostValid] = useState(true);
  const postText = useRef<HTMLInputElement>();
  const csrf = useCSRF();
  const queryClient = useQueryClient();

  const handleClickOpen = (event: SyntheticEvent) => {
    event.preventDefault();
    setOpen(true);
  };
  const handleClose = (event: SyntheticEvent) => {
    event.preventDefault();
    setOpen(false);
    setPostValid(true);
  };

  const handlePost = (event: SyntheticEvent) => {
    if (!postText.current?.value) {
      setPostValid(false);
    } else {
      handleClose(event);
      const body = {
        text: postText.current?.value,
      };
      fetch(`${appPath}/api/posts/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeader(csrf),
        },
        body: JSON.stringify(body),
      }).then(() => invalidateCsrfToken(queryClient))
        .then(() => {
          return queryClient.invalidateQueries({ queryKey: QueryKeys.posts });
        });
    }
  };

  return (
    <>
      <Button
        href='/'
        variant='contained'
        onClick={handleClickOpen}
        sx={{ position: 'fixed', bottom: '05%', right: '25%' }}
      >
        New post
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>New post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='post'
            multiline
            rows={4}
            fullWidth
            variant='outlined'
            inputRef={postText}
            error={!postValid}
            helperText={!postValid && 'Invalid entry'}
          />
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handlePost}>Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Landing (or Home) page of the application.
 * The page shows the latest posts made by the users of the application
 * and a button to create a new post for an authenticated user.
 */
export default function Home() {
  const { isAuthenticated } = useUser();
  return (
    <>
      <Head>
        <title>App</title>
      </Head>
      <NavBar />
      <Posts />
      { isAuthenticated ? (
        <NewPostButton />
      ) : null}
    </>
  );
}
