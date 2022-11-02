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

export type ROLE_TYPES = 'admin' | 'moderator' | 'member';

export type VolunteerGroup = {
  about: string;
  contentContainerId: number;
  description?: string;
  guid: string;
  id: number;
  joinPolicy?: JOIN_POLICY_TYPES;
  name: string;
  owner: {
    display_name: string;
    guid: string;
    id: number;
    url: string;
  };
  tags?: string;
  visibility?: VISIBILITY_TYPES;
};
