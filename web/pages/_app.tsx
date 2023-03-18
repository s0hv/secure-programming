import * as React from 'react';
import { type FC, type PropsWithChildren, useMemo } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '@/utils/createEmotionCache';
import { theme } from '@/utils/theme';
import { type UserContextValue, UserProvider } from '@/utils/useUser';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { handleResponse } from '@/types/api/utilities';
import { FrontendUser } from '@/types/api/user';
import { QueryKeys } from '@/utils/constants';
import { csrfHeader, CSRFProvider } from '@/utils/useCsrf';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const Root: FC<PropsWithChildren> = ({ children }) => {
  const { data: csrf } = useQuery({
    queryKey: QueryKeys.csrf,
    retry: false,
    queryFn: () => fetch('http://localhost:8080/api/auth/csrf', {
      method: 'POST',
      credentials: 'include',
    })
      .then(handleResponse<string>('csrf')),
  });

  const { data: user, isFetching } = useQuery<FrontendUser | null>({
    queryKey: QueryKeys.user,
    retry: false,
    enabled: !!csrf,
    queryFn: () => fetch('http://localhost:8080/api/user/authenticate', {
      method: 'POST',
      credentials: 'include',
      headers: csrfHeader(csrf),
    })
      .then(handleResponse<FrontendUser | null>('user')),
  });

  const providerValue = useMemo<UserContextValue>(() => ({
    user,
    isFetching,
  }), [user, isFetching]);

  return (
    <CSRFProvider value={csrf}>
      <UserProvider value={providerValue}>
        {children}
      </UserProvider>
    </CSRFProvider>
  );
};

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <Root>
            <Component {...pageProps} />
          </Root>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
