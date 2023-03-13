import { createContext, useContext, useMemo } from 'react';

export type FrontendUser = {
  id: string,
  username: string,
  admin: boolean,
}

const UserContext = createContext<FrontendUser | undefined>(undefined);
export const UserProvider = UserContext.Provider;

export const useUser = () => {
  const user = useContext(UserContext);
  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user && user.admin,
  }), [user]);
};
