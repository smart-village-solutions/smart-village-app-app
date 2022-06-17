export const storageNameCreator = ({ downloadableDataItem, objectItem }) => {
  const { id: objectId } = downloadableDataItem;
  const { title, type, id } = objectItem;

  return `${objectId}-${title}${id}.${type}`;
};
