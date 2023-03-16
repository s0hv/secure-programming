import { createContext, useContext, useMemo } from 'react';
import { FrontendUser } from '@/types/api/user';


export type UserContextValue = {
  user?: FrontendUser
  isFetching: boolean
}

export type UseUser = () => UserContextValue & {
  isAuthenticated: boolean
  isAdmin: boolean
}

const UserContext = createContext<UserContextValue>({ isFetching: false });
export const UserProvider = UserContext.Provider;

export const useUser: UseUser = () => {
  const { user, isFetching } = useContext(UserContext);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.admin,
    isFetching,
  }), [user, isFetching]);
};
