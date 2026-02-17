import { ErrorSavingCard } from '../../helpers';
import { TApiConnection } from '../../types';

export const fetchCardInfo = async ({
  apiConnection,
  cardNumber,
  cardPin
}: {
  apiConnection: TApiConnection;
  cardNumber: string;
  cardPin?: string;
}) => {
  const { endpoint, network, origin, referer } = apiConnection;

  const formData = new FormData();
  formData.append('code', cardNumber);
  !!cardPin && formData.append('pin', cardPin);
  formData.append('network', network);

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Origin: origin,
      Referer: referer
    },
    body: formData
  };

  const response = await fetch(endpoint, fetchObj);

  if (!response.ok) {
    // Throw an error with status info for upstream error handling
    throw new Error(`${ErrorSavingCard.IS_NOT_VALID}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
