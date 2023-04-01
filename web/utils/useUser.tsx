import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FrontendUser } from '@/types/api/user';
import { QueryKeys } from '@/utils/constants';


export type UserContextValue = {
  user?: FrontendUser | null
  isLoading: boolean
}

export type UseUser = () => UserContextValue & {
  isAuthenticated: boolean
  isAdmin: boolean
  setUser: (user: FrontendUser | null | undefined) => void
}

const UserContext = createContext<UserContextValue>({ isLoading: false });
export const UserProvider = UserContext.Provider;

export const useUser: UseUser = () => {
  const { user, isLoading } = useContext(UserContext);
  const client = useQueryClient();

  const setUser = useCallback((newUser: FrontendUser | null | undefined) => {
    client.setQueryData(QueryKeys.user, newUser);
  }, [client]);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.admin,
    isLoading,
    setUser,
  }), [user, isLoading, setUser]);
};
