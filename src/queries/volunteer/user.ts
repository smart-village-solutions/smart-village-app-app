import { formatDate } from '../../helpers/formatHelper';
import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
import { VolunteerUser } from '../../types';

export const users = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}user`, fetchObj)).json();
};

export const user = async ({ id }: { id: number }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}user/${id}`, fetchObj)).json();
};

export const userEdit = async ({
  about,
  birthday,
  birthdayHideYear,
  city,
  country,
  email,
  facebook,
  fax,
  firstName,
  flickr,
  gender,
  id,
  lastName,
  linkedin,
  mySpace,
  phoneMobile,
  phonePrivate,
  phoneWork,
  postalCode,
  skype,
  state,
  street,
  title,
  twitter,
  username,
  vimeo,
  website,
  xing,
  xmpp,
  youtube
}: VolunteerUser) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    account: {
      email,
      username
    },
    profile: {
      about,
      birthday: birthday && formatDate(birthday),
      birthday_hide_year: birthdayHideYear ? 1 : 0,
      city,
      country,
      fax,
      firstname: firstName,
      gender,
      im_skype: skype,
      im_xmpp: xmpp,
      lastname: lastName,
      mobile: phoneMobile,
      phone_private: phonePrivate,
      phone_work: phoneWork,
      state,
      street,
      title,
      url_facebook: facebook,
      url_flickr: flickr,
      url_linkedin: linkedin,
      url_myspace: mySpace,
      url_twitter: twitter,
      url_vimeo: vimeo,
      url_xing: xing,
      url_youtube: youtube,
      url: website,
      zip: postalCode
    }
  };

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiV1Url}user/${id}`, fetchObj)).json();
};

export const userGroups = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}user/group`, fetchObj)).json();
};

export const userNotificationSettings = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}user/notification-settings`, fetchObj)).json();
};
export const userNotificationSettingsUpdate = async ({ category, isEnabled, target }) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    settings: [
      {
        category,
        isEnabled,
        target
      }
    ]
  };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiV2Url}user/notification-settings`, fetchObj)).json();
};
