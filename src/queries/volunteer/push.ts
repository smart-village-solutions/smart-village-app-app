import { volunteerApiV2Url } from '../../helpers/volunteerHelper';
import { getPushTokenFromStorage } from '../../pushNotifications';

export const storePushToken = async (authToken: string) => {
  const token = await getPushTokenFromStorage();

  const fetchObj = {
    method: 'PUT',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV2Url}sva_push/token/${token}`, fetchObj);
};
