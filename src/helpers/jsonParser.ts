export const jsonParser = (data: any) => {
  try {
    return !!data && JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
};
