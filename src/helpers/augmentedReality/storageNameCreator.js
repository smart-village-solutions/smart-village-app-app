import { documentDirectory } from 'expo-file-system';

export const storageNameCreator = ({ dataItem, objectItem }) => {
  const objectItemTitleWithoutSpaces = dataItem.title.replace(/\s+/g, '');
  const dataDirectoryName = `${objectItemTitleWithoutSpaces}_${dataItem.id}`;
  const objectName = `${objectItem.title}.${objectItem.type}`;

  return {
    directoryName: documentDirectory + `${dataDirectoryName}/${objectName}`,
    folderName: documentDirectory + `${dataDirectoryName}`,
    storageName: `${dataDirectoryName}_${objectName}`
  };
};
