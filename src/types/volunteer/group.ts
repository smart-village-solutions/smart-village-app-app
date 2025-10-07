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

export enum ROLE_TYPES {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

export type VolunteerOwner = {
  display_name: string;
  guid: string;
  id: number;
  url: string;
};

export type VolunteerGroup = {
  about: string;
  contentContainerId: number;
  description?: string;
  guid: string;
  hideMembers: number;
  id: number;
  joinPolicy?: JOIN_POLICY_TYPES;
  name: string;
  owner: VolunteerOwner;
  tags?: string;
  visibility?: VISIBILITY_TYPES;
};
