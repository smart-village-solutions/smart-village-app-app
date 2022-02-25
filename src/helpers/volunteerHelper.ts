import * as SecureStore from 'expo-secure-store';
import moment from 'moment';

import * as appJson from '../../app.json';
import { secrets } from '../config';
import { QUERY_TYPES } from '../queries/types';

import { eventDate } from './dateTimeHelper';
import { subtitle } from './textHelper';

const namespace = appJson.expo.slug as keyof typeof secrets;
const serverUrl = secrets[namespace]?.volunteer?.serverUrl;

const VOLUNTEER_AUTH_TOKEN = 'VOLUNTEER_AUTH_TOKEN';
const VOLUNTEER_CURRENT_USER_ID = 'VOLUNTEER_CURRENT_USER_ID';
const VOLUNTEER_CONTENT_CONTAINER_ID = 'VOLUNTEER_CONTENT_CONTAINER_ID';

export const storeVolunteerAuthToken = (authToken?: string) => {
  if (authToken) {
    SecureStore.setItemAsync(VOLUNTEER_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(VOLUNTEER_AUTH_TOKEN);
  }
};

export const volunteerAuthToken = () => SecureStore.getItemAsync(VOLUNTEER_AUTH_TOKEN);

export const storeVolunteerUserData = (userData?: { id: number; contentcontainer_id: number }) => {
  if (userData) {
    SecureStore.setItemAsync(VOLUNTEER_CURRENT_USER_ID, `${userData.id}`);
    SecureStore.setItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID, `${userData.contentcontainer_id}`);
  } else {
    SecureStore.deleteItemAsync(VOLUNTEER_CURRENT_USER_ID);
    SecureStore.deleteItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID);
  }
};

export const volunteerUserData = async (): Promise<{
  currentUserId: string | null;
  contentContainerId: string | null;
}> => {
  const currentUserId = await SecureStore.getItemAsync(VOLUNTEER_CURRENT_USER_ID);
  const contentContainerId = await SecureStore.getItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID);

  return {
    currentUserId,
    contentContainerId
  };
};

export const volunteerListDate = (data: { end_datetime: string; start_datetime: string }) => {
  const { end_datetime: endDatetime, start_datetime: startDatetime } = data;

  if (moment().isBetween(startDatetime, endDatetime)) return moment().format('YYYY-MM-DD');

  return moment(startDatetime).format('YYYY-MM-DD');
};

export const volunteerSubtitle = (volunteer: any, query: string, withDate: boolean) => {
  return subtitle(
    withDate ? eventDate(volunteerListDate(volunteer)) : undefined,
    query !== QUERY_TYPES.VOLUNTEER.CALENDAR && volunteer.tags
  );
};

export const isAttending = (currentUserId: string | null, attending?: []): boolean => {
  if (!currentUserId || !attending?.length) return false;

  return attending.some((item: { id: number }) => item.id.toString() == currentUserId);
};

export const volunteerProfileImage = (guid: string) =>
  `${serverUrl}/uploads/profile_image/${guid}.jpg`;

export const volunteerBannerImage = (guid: string) =>
  `${serverUrl}/uploads/profile_image/banner/${guid}.jpg`;
