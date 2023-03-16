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

const Posts: FC = () => {
  const x: PostProps = { userId: 'e2ff2afa', timestamp: '10:23', text: 'Lorem ipsum' };
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
        <Post {...x} />
        <Post
          userId='ddddd'
          timestamp='9:33'
          text='aaaaaaaaaaaaaaaaaaaaa'
        />
        <Skeleton
          variant='rectangular'
          width={510}
          height={180}
          animation={false}
        />
        <Skeleton
          variant='rectangular'
          width={510}
          height={160}
          animation={false}
        />
        <Skeleton
          variant='rectangular'
          width={510}
          height={190}
          animation={false}
        />
        <Skeleton
          variant='rectangular'
          width={510}
          height={190}
          animation={false}
        />
        <Skeleton
          variant='rectangular'
          width={510}
          height={190}
          animation={false}
        />
      </Stack>
    </Container>
  );
};

const NewPostButton: FC = () => {
  const [open, setOpen] = useState(false);
  const [postValid, setPostValid] = useState(true);
  const postText = useRef<HTMLInputElement>();

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
      // window.location.reload();
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
