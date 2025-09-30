import * as FileSystem from 'expo-file-system/legacy';

import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
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

  return (await fetch(`${volunteerApiV2Url}mail`, fetchObj)).json();
};

export const conversation = async ({ id }: { id: number }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}mail/${id}/entries`, fetchObj)).json();
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

  return (await fetch(`${volunteerApiV1Url}mail/${id}/users`, fetchObj)).json();
};

export const conversationNew = async ({
  displayName,
  id: guids,
  title,
  message
}: VolunteerConversation) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    title: displayName ? `${displayName}: ${title}` : title,
    message,
    recipient: guids
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

  return (await fetch(`${volunteerApiV1Url}mail`, fetchObj)).json();
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

  return (await fetch(`${volunteerApiV1Url}mail/${id}/entry`, fetchObj)).json();
};

export const conversationUpload = async (uri: string, conversationId: number, mimeType: string) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'files',
    mimeType
  };

  return await FileSystem.uploadAsync(
    `${volunteerApiV2Url}mail/${conversationId}/upload-files`,
    uri,
    fetchObj
  );
};
