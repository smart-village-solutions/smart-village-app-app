import { volunteerApiUrl, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { VolunteerConversation } from '../../types';

export const conversations = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}mail`, fetchObj)).json();
};

export const conversation = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}mail/${id}/entries`, fetchObj)).json();
};

export const conversationRecipients = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}mail/${id}/users`, fetchObj)).json();
};

export const conversationNew = async ({ id: guid, title, message }: VolunteerConversation) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    title,
    message,
    recipient: [guid]
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

  return (await fetch(`${volunteerApiUrl}mail`, fetchObj)).json();
};

export const conversationNewEntry = async ({ id, message }: VolunteerConversation) => {
  const authToken = await volunteerAuthToken();

  const formData = { message };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiUrl}mail/${id}/entry`, fetchObj)).json();
};
