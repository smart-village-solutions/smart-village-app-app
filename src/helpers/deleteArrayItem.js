export const deleteArrayItem = (items, moveFromIndex) => {
  const newItems = [...items];
  newItems.splice(moveFromIndex, 1);

  return newItems;
};
