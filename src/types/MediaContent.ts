import { WebUrl } from './WebUrl';

export type MediaContent = {
  captionText?: string;
  contentType?: string;
  copyright?: string;
  height: number;
  id: string;
  sourceUrl: WebUrl;
  width: number;
};
