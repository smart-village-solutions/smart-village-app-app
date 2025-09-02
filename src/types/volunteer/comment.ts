export type VolunteerComment = {
  comments: VolunteerComment[];
  commentsCount: number;
  createdAt: string;
  createdBy: {
    guid: string;
    display_name: string;
  };
  files?: string;
  id?: number;
  likes: {
    total: number;
  };
  message?: string;
};
