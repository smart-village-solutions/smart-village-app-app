import { VolunteerUser } from './user';

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

export enum MEMBER_STATUS_TYPES {
  NONE,
  INVITED,
  APPLICANT,
  MEMBER
}

export type VolunteerGroup = {
  guid: string;
  id: number;
  name: string;
  description?: string;
  owner: VolunteerUser;
  visibility?: VISIBILITY_TYPES;
  joinPolicy?: JOIN_POLICY_TYPES;
  tags?: string;
  contentContainerId: number;
};
