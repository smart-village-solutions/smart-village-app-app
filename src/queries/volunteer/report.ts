import { volunteerApiV2Url, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { VolunteerReportError, VolunteerReportRequest, VolunteerReportResponse } from '../../types';

const readJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const reportVolunteerTarget = async (
  report: VolunteerReportRequest
): Promise<VolunteerReportResponse> => {
  const authToken = await volunteerAuthToken();

  try {
    const response = await fetch(`${volunteerApiV2Url}reports`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify(report)
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new VolunteerReportError(
        data.message || 'Report request failed.',
        response.status,
        data.error
      );
    }

    return data as VolunteerReportResponse;
  } catch (error) {
    if (error instanceof VolunteerReportError) throw error;

    throw new VolunteerReportError('Network request failed.', 0, 'network_error');
  }
};
