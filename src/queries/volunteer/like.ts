import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';

export const likeNew = async ({
  objectId,
  objectModel
}: {
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
      objectId,
      objectModel
    })
  };

  return (await fetch(`${volunteerApiV2Url}like`, fetchObj)).json();
};

export const likeDelete = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV1Url}like/${id}`, fetchObj)).json();
};

export const likesByObject = async ({
  objectId,
  objectModel
}: {
  objectId: number;
  objectModel: string;
}) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (
    await fetch(
      `${volunteerApiV1Url}like/find-by-object?model=${objectModel}&pk=${objectId}`,
      fetchObj
    )
  ).json();
};
