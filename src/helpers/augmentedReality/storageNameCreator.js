export const storageNameCreator = ({ dataItem, objectItem }) => {
  const { id: objectId } = dataItem;
  const { title, type, id } = objectItem;

  return `${objectId}-${title}${id}.${type}`;
};
