import { volunteerApiUrl, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { VolunteerPost } from '../../types';

export const posts = async (contentContainerId: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}post/container/${contentContainerId}`, fetchObj)).json();
};

export const post = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}post/${id}`, fetchObj)).json();
};

export const postNew = async ({ message, contentContainerId }: VolunteerPost) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    data: {
      message
    }
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

  return (await fetch(`${volunteerApiUrl}post/container/${contentContainerId}`, fetchObj)).json();
};
