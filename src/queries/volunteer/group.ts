import { volunteerApiUrl, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { JOIN_POLICY_TYPES, VISIBILITY_TYPES, VolunteerGroup } from '../../types';

export const groups = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}space`, fetchObj)).json();
};

export const group = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}space/${id}`, fetchObj)).json();
};

export const groupNew = async ({
  name,
  description,
  visibility = VISIBILITY_TYPES.ALL,
  joinPolicy = JOIN_POLICY_TYPES.OPEN
}: VolunteerGroup) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    name,
    description,
    visibility: visibility ? VISIBILITY_TYPES.ALL : VISIBILITY_TYPES.REGISTERED_ONLY,
    join_policy: joinPolicy ? JOIN_POLICY_TYPES.OPEN : JOIN_POLICY_TYPES.INVITE_AND_REQUEST
  };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiUrl}space`, fetchObj)).json();
};

export const groupEdit = async ({
  name,
  description,
  visibility,
  joinPolicy,
  tags,
  id
}: VolunteerGroup & { id: number }) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    name,
    description,
    visibility: visibility ? VISIBILITY_TYPES.ALL : VISIBILITY_TYPES.REGISTERED_ONLY,
    join_policy: joinPolicy ? JOIN_POLICY_TYPES.OPEN : JOIN_POLICY_TYPES.INVITE_AND_REQUEST,
    tags
  };

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiUrl}space/${id}`, fetchObj)).json();
};

export const groupMembership = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}space/${id}/membership`, fetchObj)).json();
};

export const groupJoin = async ({ id, userId }: { id: number; userId: string }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}space/${id}/membership/${userId}`, fetchObj)).json();
};

export const groupLeave = async ({ id, userId }: { id: number; userId: string }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}space/${id}/membership/${userId}`, fetchObj)).json();
};
