import appJson from '../../../app.json';

export const shareMessage = (data) => {
  const buildMessage = () => {
    return [data?.name, data?.teaser].filter(Boolean).join(': ');
  };

  return `[Bürger- und Unternehmensservice] ${buildMessage()}\n\nQuelle: ${appJson.expo.name}`;
};
