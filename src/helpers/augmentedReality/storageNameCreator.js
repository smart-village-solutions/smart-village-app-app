import { documentDirectory } from 'expo-file-system';

import { consts } from '../../config';

const { IMAGE_TYPE_REGEX } = consts;

export const storageNameCreator = ({ dataItem, objectItem }) => {
  /* `textureType` has been added because we need the type of texture data. with the `REGEX` we have 
	  prepared in advance, we must find out exactly what type the texture data is and add this type 
		to the end of the texture name. otherwise the texture files cannot be read properly and will 
		not work.
		for example:
		file type from server   = edited file type
		Ch17_1001.texture 	    = Ch17_1001.png
		Ch17_1002.texture       = Ch17_1002.jpg
		augmentedReality.target = augmentedReality.png
		Musik.mp3               = Musik.mp3
		test.vrx                = test.vrx
 	*/
  const textureType = IMAGE_TYPE_REGEX.exec(objectItem.uri);
  const objectItemTitleWithoutSpaces = dataItem.title.replace(/\s+/g, '');
  const dataDirectoryName = `${objectItemTitleWithoutSpaces}_${dataItem.id}`;
  const objectName = `${objectItem.title}.${textureType ? textureType[1] : objectItem.type}`;

  return {
    directoryName: documentDirectory + `${dataDirectoryName}/${objectName}`,
    folderName: documentDirectory + `${dataDirectoryName}`,
    storageName: `${dataDirectoryName}_${objectName}`
  };
};
