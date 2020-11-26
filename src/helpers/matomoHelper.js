import { v4 as uuid } from 'uuid';

import { storageHelper } from '../helpers/storageHelper';

export const matomoSettings = async () => {
  let settings = await storageHelper.matomoSettings();

  // if there are no matomo settings yet, init without consent
  if (!settings) {
    settings = {
      consent: false
    };
  }

  // if a consent is given and there is no user ID yet, create it
  if (settings.consent && !settings.userId) {
    settings.userId = uuid();
  }

  // if a consent is not given and there is an old user ID, remove it
  else if (!settings.consent && settings.userId) {
    delete settings.userId;
  }

  storageHelper.setMatomoSettings(settings);

  return settings;
};

/**
 * Create a Matomo user id and add the consent to be tracked.
 */
export const createMatomoUserId = async () => {
  const settings = await storageHelper.matomoSettings();

  if (settings) {
    settings.userId = uuid();
    settings.consent = true;
    storageHelper.setMatomoSettings(settings);
  }
};

/**
 * Remove a Matomo user id and the consent to be tracked.
 */
export const removeMatomoUserId = async () => {
  const settings = await storageHelper.matomoSettings();

  if (settings && settings.userId) {
    delete settings.userId;
    settings.consent = false;
    storageHelper.setMatomoSettings(settings);
  }
};

/**
 * Save the user interaction with the Matomo alert on app startup, because the alert should only
 * be shown once.
 */
export const setMatomoHandledOnStartup = async () => {
  const settings = await storageHelper.matomoSettings();

  if (settings) {
    settings.matomoHandledOnStartup = true;
    storageHelper.setMatomoSettings(settings);
  }
};

/**
 * Build the tracking string with filtering null values out, as the data provider or categories
 * could be empty.
 *
 * @param {Array} entries - containing the screen and maybe data provider, categories and others
 *
 * @return {String} joined present entries separated by /
 */
export const matomoTrackingString = (entries) => entries.filter((entry) => !!entry).join(' / ');
