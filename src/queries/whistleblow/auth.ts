import { proofOfWork } from '../../helpers/whistleblow/globaleaks/proofOfWork';

export const token = async (endpoint: string) => {
  const fetchObj = {
    method: 'POST'
  };

  const response = await fetch(`${endpoint}/auth/token`, fetchObj);
  const json = (await response.json()) as { id: string };

  return json?.id;
};

export const receiptauth = async (endpoint: string, id: string) => {
  const answer = await proofOfWork(id);

  const fetchObj = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Token': `${id}:${answer}`
    },
    body: JSON.stringify({ receipt: '' })
  };

  const response = await fetch(`${endpoint}/auth/receiptauth`, fetchObj);
  const json = (await response.json()) as { id: string };

  return json?.id;
};
