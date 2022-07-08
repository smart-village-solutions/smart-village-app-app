export const storageNameCreator = ({ dataItem, objectItem }) => {
  const { id: objectId, title: objectTitle } = dataItem;
  const { title, type } = objectItem;

  /*
	each texture file has a special name. viro uses these special names. 
	we need to save them in the file directory with these names. the problem 
	here is that the texture names of different objects may be the same. if 
	this happens, when downloading the file, it saves it in place of the 
	previous downloaded one and the object cannot be loaded properly. 
	we need a different directory for each object. the file system does not 
	allow us to create new directories. we have to find a different way!
	*/

  /*
	  TODO: error when creating a directory
         the file directory to be created is specified in the comment line
   	Expo-FileSystem Document:
    	https://docs.expo.dev/versions/latest/sdk/filesystem/#filesystemdocumentdirectory

		return `${objectTitle.replace(/\s+/g, '')}_${objectId}/${title}.${type}`;
	 */

  return `${title}.${type}`;
};
