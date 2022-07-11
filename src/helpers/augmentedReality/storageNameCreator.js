import { documentDirectory } from 'expo-file-system';

export const storageNameCreator = ({ dataItem, objectItem }) => {
  const { id: objectId, title: objectTitle } = dataItem;
  const { title, type } = objectItem;
  const replacedObjectTitle = objectTitle.replace(/\s+/g, '');

  return {
    directoryName: documentDirectory + `${replacedObjectTitle}_${objectId}/${title}.${type}`,
    folderName: documentDirectory + `${replacedObjectTitle}_${objectId}`,
    storageName: `${replacedObjectTitle}_${objectId}_${title}.${type}`
  };
};
