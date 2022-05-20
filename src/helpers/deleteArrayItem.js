export const deleteArrayItem = (mainArray, moveFromIndex) => {
  const array = mainArray;
  array.splice(moveFromIndex, 1);

  return array;
};
