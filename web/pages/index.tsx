import Head from 'next/head';
import { NavBar } from '@/components/NavBar';
import { FC } from 'react';
import { Button, Container, Skeleton, Stack, Typography } from '@mui/material';
import { Post } from '@/components/Post';
import { type Post as PostProps } from '@/types/api/post';

const Posts: FC = () => {
  const x: PostProps = { userId: 'e2ff2afa', timestamp: '10:23', text: 'Lorem ipsum' };
  return (
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
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>App</title>
      </Head>
      <NavBar />
      <Container
        component='main'
        maxWidth='xs'
        sx={{
          mb: 5,
        }}
      >
        <Typography
          variant='h5'
          sx={{ mb: 1 }}
        >
          Latest posts
        </Typography>
        <Posts />
      </Container>
      <Button
        href='/'
        variant='contained'
        sx={{ position: 'fixed', bottom: '05%', right: '25%' }}
      >
        New post
      </Button>
    </>
  );
}
