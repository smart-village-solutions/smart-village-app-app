import { volunteerApiV1Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

export const commentNew = async ({
  message,
  objectId,
  objectModel
}: {
  message: string;
  objectId: number;
  objectModel: string;
}) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify({
      Comment: {
        message
      },
      objectId,
      objectModel
    })
  };

  return (await fetch(`${volunteerApiV1Url}comment`, fetchObj)).json();
};

export const comment = async ({ id }: { id: number }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV1Url}comment/${id}`, fetchObj)).json();
};

export const commentEdit = async ({ id, message }: { id: number; message: string }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify({
      Comment: {
        message
      }
    })
  };

  return (await fetch(`${volunteerApiV1Url}comment/${id}`, fetchObj)).json();
};

export const commentDelete = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV1Url}comment/${id}`, fetchObj)).json();
};

export const commentsByObject = async ({
  objectId,
  objectModel,
  page = 1
}: {
  objectId: number;
  objectModel: string;
  page?: number;
}) => {
  const authToken = await volunteerAuthToken();

  const params = new URLSearchParams();
  params.append('objectModel', objectModel);
  params.append('objectId', String(objectId));
  params.append('page', String(page));

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV1Url}comment/find-by-object?${params}`, fetchObj)).json();
};
