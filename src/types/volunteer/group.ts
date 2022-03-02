enum JOIN_POLICY_TYPES {
  INVITE,
  INVITE_AND_REQUEST,
  OPEN
}

export type VolunteerGroup = {
  name: string;
  description?: string;
  visibility?: number;
  joinPolicy?: JOIN_POLICY_TYPES;
  color?: string;
  tags?: [string];
};
