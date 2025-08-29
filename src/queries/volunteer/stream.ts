import { volunteerApiV2Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

export const stream = async ({ page = 1 }: { page?: number }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (
    await fetch(`${volunteerApiV2Url}stream?page=${encodeURIComponent(page)}`, fetchObj)
  ).json();
};
