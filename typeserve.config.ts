import { defineMock } from '@typeserve/core';

export default defineMock({
  port: 5005,
  basePath: '/api',
  routes: [
    {
      path: '/users',
      method: 'GET',
      type: 'User[]',
      count: 2,
    },
    {
      path: '/users/:id',
      method: 'GET',
      type: 'User',
    },
    {
      path: '/posts',
      method: 'GET',
      type: 'Post[]',
    },
    {
      path: '/posts',
      method: 'POST',
      type: 'Post',
    },
  ],
});
