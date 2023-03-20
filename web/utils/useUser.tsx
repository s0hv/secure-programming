import { createContext, useCallback, useContext, useMemo } from 'react';
import { FrontendUser } from '@/types/api/user';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/constants';


export type UserContextValue = {
  user?: FrontendUser | null
  isFetching: boolean
}

export type UseUser = () => UserContextValue & {
  isAuthenticated: boolean
  isAdmin: boolean
  setUser: (user: FrontendUser | null | undefined) => void
}

const UserContext = createContext<UserContextValue>({ isFetching: false });
export const UserProvider = UserContext.Provider;

export const useUser: UseUser = () => {
  const { user, isFetching } = useContext(UserContext);
  const client = useQueryClient();

  const setUser = useCallback((newUser: FrontendUser | null | undefined) => {
    client.setQueryData(QueryKeys.user, newUser);
  }, [client]);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.admin,
    isFetching,
    setUser,
  }), [user, isFetching, setUser]);
};
