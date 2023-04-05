export const QueryKeys = {
  user: ['user'],
  posts: ['posts'],
  csrf: ['csrf'],
} satisfies Record<string, string[]>;

export const appPath = process.env.NEXT_PUBLIC_APP_PATH ?? '';
