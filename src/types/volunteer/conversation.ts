export type VolunteerConversation = {
  displayName?: string;
  id: [number];
  medias: [{ mimeType: string; type: string; uri: string }] | [];
  message: string;
  title: string;
};
