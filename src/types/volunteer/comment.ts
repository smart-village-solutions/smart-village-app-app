export type VolunteerFileObject = {
  id: number;
  guid: string;
  mime_type: string;
};

export type VolunteerComment = {
  comments: VolunteerComment[];
  commentsCount: number;
  createdAt: string;
  createdBy: {
    guid: string;
    display_name: string;
  };
  files?: string | VolunteerFileObject[];
  id?: number;
  likes: {
    total: number;
  };
  message?: string;
};
