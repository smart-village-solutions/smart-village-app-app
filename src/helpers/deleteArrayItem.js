export const deleteArrayItem = (items, moveFromIndex) => {
  items.splice(moveFromIndex, 1);

  return items;
};
