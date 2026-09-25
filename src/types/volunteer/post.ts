export type VolunteerPost = {
  content?: {
    id: number;
    metadata?: {
      contentcontainer_id?: number;
      created_by?: {
        guid: string;
      };
      id?: number;
    };
  };
  contentContainerId?: number;
  files?: string;
  id?: number;
  message?: string;
};
