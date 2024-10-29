import { GlobaleaksSubmission } from '../../types';

export const submission = async (endpoint: string, id: string, body: GlobaleaksSubmission) => {
  const fetchObj = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session': id
    },
    body: JSON.stringify(body)
  };

  const response = await fetch(`${endpoint}/whistleblower/submission`, fetchObj);
  const json = (await response.json()) as { receipt: string };

  return json?.receipt;
};
