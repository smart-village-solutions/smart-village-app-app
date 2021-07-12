import { MediaContent } from './MediaContent';

export type ContentBlock = {
  body?: string;
  createdAt?: string;
  intro?: string;
  mediaContents: MediaContent[];
  title?: string;
  updatedAt?: string;
};
