import Head from 'next/head';
import { NavBar } from '@/components/NavBar';
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
import { Post } from '@/components/Post';
import { type Post as PostProps } from '@/types/api/post';
import { useUser } from '@/utils/useUser';
import { handleResponse } from '@/types/api/utilities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/constants';

const Posts: FC = () => {
  const { data: posts, isFetching } = useQuery<PostProps[]>({
    queryKey: QueryKeys.posts,
    initialData: [],
    queryFn: () => fetch('http://localhost:8080/api/posts', {
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
              key={idx}
              variant='rectangular'
              width={500}
              height={190}
            />
          ))) : (
          posts.slice(0).reverse().map((el) => (
            <Post key={el.postId} {...el} />)))}
      </Stack>
    </Container>
  );
};

const NewPostButton: FC = () => {
  const [open, setOpen] = useState(false);
  const [postValid, setPostValid] = useState(true);
  const postText = useRef<HTMLInputElement>();
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
      console.log(`Make a new post with userid, timestamp, and content: ${postText.current?.value}`);
      // return queryClient.invalidateQueries({ queryKey: QueryKeys.posts });
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
        <DialogActions>
          <Button onClick={handleClose} sx={{ position: 'absolute', left: '02%' }}>Cancel</Button>
          <Button variant='contained' onClick={handlePost}>Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

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
      ) : (
        <NewPostButton />
      )}
    </>
  );
}
