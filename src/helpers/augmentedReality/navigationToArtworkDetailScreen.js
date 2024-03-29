import { ScreenName } from '../../types';

export const navigationToArtworksDetailScreen = ({
  data,
  isNavigation,
  isShow,
  modelId,
  navigation,
  setModelData
}) => {
  for (let index = 0; index < data.length; index++) {
    const { id } = data[index];

    if (id.toString() === modelId) {
      if (isNavigation) {
        return navigation.navigate(ScreenName.ArtworkDetail, { data, index });
      } else if (isShow) {
        return setModelData(data[index]);
      }
    }
  }
};
