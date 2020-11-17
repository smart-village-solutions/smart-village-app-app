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

export const createMatomoUserId = async () => {
  let settings = await storageHelper.matomoSettings();

  if (settings) {
    settings.userId = uuid();
    storageHelper.setMatomoSettings(settings);
  }
};


export const removeMatomoUserId = async () => {
  let settings = await storageHelper.matomoSettings();

  if (settings && settings.userId) {
    delete settings.userId;
    storageHelper.setMatomoSettings(settings);
  }
};
