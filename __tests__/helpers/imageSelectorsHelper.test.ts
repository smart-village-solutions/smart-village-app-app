import { getFileSize } from '../../src/helpers/fileSystem';
import { consts } from '../../src/config/consts';
import { errorTextGenerator } from '../../src/helpers/consul';
import { onImageSelect } from '../../src/helpers/selectors/imageSelectorsHelper';

jest.mock('../../src/config', () => ({
  consts: jest.requireActual('../../src/config/consts').consts,
  texts: {}
}));
jest.mock('../../src/helpers/fileSystem', () => ({ getFileSize: jest.fn() }));
jest.mock('../../src/queries/mediaContent', () => ({}));
jest.mock('../../src/queries/volunteer', () => ({}));
jest.mock('../../src/helpers/consul', () => ({ errorTextGenerator: jest.fn() }));

it.each(['image/jpeg', undefined])(
  'stores a .jpg with upload MIME image/jpeg (asset MIME: %s) and measures its file',
  async (mimeType) => {
    const setImagesAttributes = jest.fn();
    const exif = { GPSLatitude: 52, GPSLongitude: 13 };
    const coordinateCheck = {
      setValue: jest.fn(),
      setSelectedPosition: jest.fn(),
      setUpdateRegionFromImage: jest.fn(),
      setShowCoordinatesFromImageAlert: jest.fn()
    };
    const reverseGeocode = jest.fn().mockResolvedValue(undefined);
    (getFileSize as jest.Mock).mockReturnValue(2345678);

    await onImageSelect({
      configuration: { limitation: { allowedAttachmentTypes: { value: 'jpg' } } },
      coordinateCheck,
      errorType: consts.IMAGE_SELECTOR_ERROR_TYPES.SUE,
      imageFunction: async () => ({
        uri: 'file:///converted.jpg',
        type: 'image',
        mimeType,
        width: 4032,
        height: 3024,
        exif
      }),
      imagesAttributes: [],
      infoAndErrorText: '',
      maxFileSize: 31457280,
      reverseGeocode,
      selectorType: consts.IMAGE_SELECTOR_TYPES.SUE,
      setImagesAttributes,
      setInfoAndErrorText: jest.fn()
    });

    expect(getFileSize).toHaveBeenCalledWith('file:///converted.jpg');
    expect(setImagesAttributes).toHaveBeenCalledWith([
      {
        uri: 'file:///converted.jpg',
        imageName: 'converted.jpg',
        mimeType: 'image/jpeg',
        size: 2345678,
        exif
      }
    ]);
    expect(coordinateCheck.setSelectedPosition).toHaveBeenCalledWith({
      latitude: 52,
      longitude: 13
    });
    expect(errorTextGenerator).toHaveBeenCalledWith(
      expect.objectContaining({ uri: 'file:///converted.jpg', mimeType: 'image/jpeg' })
    );
  }
);

beforeEach(() => jest.clearAllMocks());
