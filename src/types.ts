// This file is used to define the types for the mock API.

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  isActive: boolean;
  address: string;
  grade: string;
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  title: string;
  description: string;
  authorId: string;
  tags: string[];
  publishedAt: string;
  views: number;
}

export enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
