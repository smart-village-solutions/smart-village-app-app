import { texts } from '../../config';
import { OrganizationPreviewData } from '../../types';

export const getOrganizationNameString = (organization?: OrganizationPreviewData) => {
  if (!organization) return texts.oparl.organization.organization;

  const { classification, name, shortName } = organization;

  return name || shortName || classification || texts.oparl.organization.organization;
};
