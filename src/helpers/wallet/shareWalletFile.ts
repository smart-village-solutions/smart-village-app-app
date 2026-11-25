// Load the optional native sharing module only when sharing is requested. Older
// installed binaries may not contain it even though an OTA includes this screen.
export const shareWalletFile = async (uri: string) => {
  // Metro resolves this literal require, but evaluates the native module only on demand.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sharing: typeof import('expo-sharing') = require('expo-sharing');
  if (!(await sharing.isAvailableAsync())) {
    throw new Error('File sharing is unavailable on this device');
  }

  await sharing.shareAsync(uri);
};
