import { documentDirectory } from 'expo-file-system/legacy';

import { consts } from '../../config';

const { IMAGE_TYPE_REGEX } = consts;

export const storageNameCreator = ({ dataItem, objectItem, sceneIndex }) => {
  const dataItemTitleWithoutSpaces = dataItem.title?.replace(/\s+/g, '');
  const dataItemTitleWithoutUmlauts = dataItemTitleWithoutSpaces?.replace(/[äöüÄÖÜß]/g, '');
  const dataDirectoryName = `${dataItemTitleWithoutUmlauts}_${dataItem.id}_${sceneIndex}`;
  const modelName = objectNameParser(objectItem);

  return {
    directoryName: documentDirectory + `${dataDirectoryName}/${modelName}`,
    folderName: documentDirectory + `${dataDirectoryName}`,
    storageName: `${dataDirectoryName}_${modelName}`
  };
};

/**
 * `textureType` has been added because we need the type of texture data. with the `REGEX` we have
 *	  prepared in advance, we must find out exactly what type the texture data is and add this type
 *		to the end of the texture name. otherwise the texture files cannot be read properly and will
 *		not work
 *		for example:
 *		file type from server   = edited file type
 *		Ch17_1001.texture 	    = Ch17_1001.png
 *		Ch17_1002.texture       = Ch17_1002.jpg
 *		augmentedReality.target = augmentedReality.png
 *		Musik.mp3               = Musik.mp3
 *		test.vrx                = test.vrx
 *
 * @param {string} title     model name
 * @param {string} type      model type
 * @param {string} uri       download link of the model
 *
 * @return {string}          concatenate parsed model name and type
 */
const objectNameParser = (objectItem) => {
  const { type, uri } = objectItem;

  const title = objectItem.title?.replace(/\s+/g, '');

  if (!title && !type && !uri) return;

  const textureType = IMAGE_TYPE_REGEX.exec(uri);

  return `${title}.${textureType ? textureType[1] : type}`;
};
