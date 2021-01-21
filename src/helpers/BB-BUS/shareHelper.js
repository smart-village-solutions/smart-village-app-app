import appJson from '../../../app.json';

export const shareMessage = (data) => {
  const buildMessage = () => {
    return `${!!data.name && data.name}: ${!!data.teaser && data.teaser}`;
  };

  return `[Bürger- und Unternehmensservice] ${buildMessage()}\n\nQuelle: ${appJson.expo.name}`;
};
