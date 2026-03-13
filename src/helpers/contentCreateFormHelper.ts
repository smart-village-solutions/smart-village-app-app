import { uploadMediaContent } from '../queries/mediaContent';

import { momentFormat } from './momentHelper';

export type OpeningHourFormValue = {
  description: string;
  endDate?: Date | null;
  endTime?: Date | null;
  isOpen: boolean;
  startDate?: Date | null;
  startTime?: Date | null;
  weekday: number;
};

export type WebUrlFormValue = {
  description: string;
  url: string;
};

export type PriceInformationFormValue = {
  description: string;
  amount: string;
};

export type AddressInput = {
  city: string;
  latitude: number | null;
  longitude: number | null;
  postcode: string;
  regionName: string;
  street: string;
};

export type ContactInput = {
  email: string;
  fax: string;
  firstname: string;
  phone: string;
  surname: string;
  url: string;
  urlText: string;
};

export type DateInput = {
  endDate?: Date | null;
  endTime?: Date | null;
  startDate?: Date | null;
  startTime?: Date | null;
};

export const buildGeoLocation = (latitude: number | null, longitude: number | null) => {
  if (latitude == null || longitude == null) return undefined;
  return { latitude, longitude };
};

export const buildAddressData = (input: AddressInput) => {
  const geoLocation = buildGeoLocation(input.latitude, input.longitude);

  return {
    ...(geoLocation && { geoLocation }),
    ...(input.city && { city: input.city }),
    ...(input.regionName && { addition: input.regionName }),
    ...(input.street && { street: input.street }),
    ...(input.postcode && { zip: input.postcode })
  };
};

export const buildContactData = (input: ContactInput) => {
  const contactWebUrl = input.url
    ? {
        url: input.url,
        ...(input.urlText && { description: input.urlText })
      }
    : undefined;

  const contact = {
    ...(input.firstname && { firstName: input.firstname }),
    ...(input.surname && { lastName: input.surname }),
    ...(input.phone && { phone: input.phone }),
    ...(input.email && { email: input.email }),
    ...(input.fax && { fax: input.fax }),
    ...(contactWebUrl && { webUrls: [contactWebUrl] })
  };

  return Object.keys(contact).length ? contact : undefined;
};

export const buildContactsData = (contacts: ContactInput[]) => {
  const contactData = contacts
    .map((contact) => buildContactData(contact))
    .filter((contact): contact is NonNullable<typeof contact> => !!contact);

  return contactData.length ? contactData : undefined;
};

export const buildDate = (input: DateInput) => {
  return [
    {
      ...(input.endDate && { dateEnd: momentFormat(input.endDate, 'YYYY-MM-DD') }),
      ...(input.endTime && { timeEnd: momentFormat(input.endTime, 'HH:mm') }),
      ...(input.startDate && { dateStart: momentFormat(input.startDate, 'YYYY-MM-DD') }),
      ...(input.startTime && { timeStart: momentFormat(input.startTime, 'HH:mm') })
    }
  ];
};

export const parseDateInputValue = (
  value?: Date | string | null,
  // Default covers ISO with/without T-separator, date-only, and time-only strings from the API
  formats: string[] = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD HH:mm:ss Z', 'YYYY-MM-DD']
) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  for (const format of formats) {
    if (format.includes('H')) {
      // Datetime or time-only format: preserve timezone by formatting to full ISO string
      const iso = momentFormat(value, 'YYYY-MM-DDTHH:mm:ss.SSSZ', format);
      if (iso === 'Invalid date') continue;
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) return d;
    } else {
      // Date-only format: extract local calendar date and create local-midnight Date
      // to avoid UTC-to-local-timezone shifts in date-only pickers.
      const dateStr = momentFormat(value, 'YYYY-MM-DD', format);
      if (dateStr === 'Invalid date') continue;
      const d = new Date(`${dateStr}T00:00:00`);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return undefined;
};

export const buildOpeningHours = (openingHours: OpeningHourFormValue[]) =>
  openingHours.map((oh) => ({
    open: oh.isOpen,
    ...(oh.startDate && { dateFrom: momentFormat(oh.startDate, 'YYYY-MM-DD') }),
    ...(oh.endDate && { dateTo: momentFormat(oh.endDate, 'YYYY-MM-DD') }),
    ...(oh.description && { description: oh.description }),
    ...(oh.startTime && { timeFrom: momentFormat(oh.startTime, 'HH:mm') }),
    ...(oh.endTime && { timeTo: momentFormat(oh.endTime, 'HH:mm') }),
    ...(oh.weekday !== undefined && oh.weekday >= 0 && { weekday: String(oh.weekday) })
  }));

export const buildWebUrls = (webUrls: WebUrlFormValue[]) =>
  webUrls
    .filter((w) => !!w.url)
    .map((w) => ({
      url: w.url,
      ...(w.description && { description: w.description })
    }));

export const buildPriceInformations = (priceInformations: PriceInformationFormValue[]) =>
  priceInformations
    .filter((p) => !!p.amount)
    .map((p) => ({
      amount: parseFloat(p.amount),
      ...(p.description && { description: p.description })
    }));

export const uploadImages = async (
  imageJson: string
): Promise<
  | { imageUrls: { sourceUrl: { url: string }; contentType: string }[]; uploadError: false }
  | { uploadError: true }
> => {
  const images = JSON.parse(imageJson);
  const imageUrls: { sourceUrl: { url: string }; contentType: string }[] = images
    .filter((image: any) => !!image.id)
    .map((image: any) => ({ contentType: 'image', sourceUrl: { url: image.uri } }));

  for (const image of images) {
    if (image.id) continue;

    try {
      const uploadedUrl = await uploadMediaContent(image, 'image');
      if (uploadedUrl) imageUrls.push({ sourceUrl: { url: uploadedUrl }, contentType: 'image' });
    } catch {
      return { uploadError: true };
    }
  }

  return { imageUrls, uploadError: false };
};
