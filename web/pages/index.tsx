import Head from 'next/head';
import { NavBar } from '@/components/NavBar';
import { FC } from 'react';
import { Button, Container, Skeleton, Stack, Typography } from '@mui/material';

const Posts: FC = () => {
  return <>
    <Stack
      direction='column'
      justifyContent='space-evenly'
      alignItems='center'
      spacing={4}
    >
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
  </>;
};

export default function Home() {
  return (
    <>
      <Head>
        <title>App</title>
      </Head>
      <NavBar/>
      <Container
        component='main'
        maxWidth='xs'
        sx={{
          textAlign: 'center',
          mb: 5
        }}
      >
        <Typography
          variant='h5'
          sx={{ mb: 1 }}
        >
                  Latest posts
        </Typography>
        <Posts/>
      </Container>
      <Button
        href='/'
        sx={{ position: 'fixed', bottom: '05%', right: '25%', }}
      >New post</Button>
    </>
  );
}
