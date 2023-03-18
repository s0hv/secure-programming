import { createContext, useContext } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/constants';

const CSRFContext = createContext<string | undefined>(undefined);
export const CSRFProvider = CSRFContext.Provider;

/**
 *
 * @return {string}
 */
export const useCSRF = () => useContext(CSRFContext);

export const invalidateCsrfToken = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: QueryKeys.csrf,
  });
};


export const csrfHeader = (csrf: string | undefined): Record<string, string> => (csrf ? {
  'X-CSRF-Token': csrf,
} : {});
