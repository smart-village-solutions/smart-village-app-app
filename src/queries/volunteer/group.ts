import { volunteerApiUrl, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { VolunteerGroup } from '../../types';

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
  visibility = 1,
  joinPolicy = 2
}: VolunteerGroup) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    name,
    description,
    visibility,
    join_policy: joinPolicy
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
    visibility,
    join_policy: joinPolicy,
    tags: tags?.join(', ')
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
