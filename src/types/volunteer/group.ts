export enum JOIN_POLICY_TYPES {
  INVITE,
  INVITE_AND_REQUEST,
  OPEN
}

export enum VISIBILITY_TYPES {
  PRIVATE,
  REGISTERED_ONLY,
  ALL
}

export type VolunteerGroup = {
  name: string;
  description?: string;
  visibility?: VISIBILITY_TYPES;
  joinPolicy?: JOIN_POLICY_TYPES;
  color?: string;
  tags?: string;
};
