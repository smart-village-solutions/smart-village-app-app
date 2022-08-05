import { documentDirectory } from 'expo-file-system';

import { consts } from '../../config';

const { IMAGE_TYPE_REGEX } = consts;

export const storageNameCreator = ({ dataItem, objectItem }) => {
  const imageType = IMAGE_TYPE_REGEX.exec(objectItem.uri);
  const objectItemTitleWithoutSpaces = dataItem.title.replace(/\s+/g, '');
  const dataDirectoryName = `${objectItemTitleWithoutSpaces}_${dataItem.id}`;
  const objectName = `${objectItem.title}.${imageType ? imageType[1] : objectItem.type}`;

  return {
    directoryName: documentDirectory + `${dataDirectoryName}/${objectName}`,
    folderName: documentDirectory + `${dataDirectoryName}`,
    storageName: `${dataDirectoryName}_${objectName}`
  };
};
