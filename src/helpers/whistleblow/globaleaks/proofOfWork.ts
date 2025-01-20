import * as Crypto from 'expo-crypto';

const str2Uint8Array = (str: string) => {
  const result = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    result[i] = str.charCodeAt(i);
  }

  return result;
};

export const proofOfWork = async (data: string): Promise<number> => {
  const work = async (i: number): Promise<number> => {
    const hashBuffer = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      String.fromCharCode.apply(null, Array.from(str2Uint8Array(data + i)))
    );
    const hash = new Uint8Array(hashBuffer.length / 2);

    // This loop is going through a string (hashBuffer) two characters at a time,
    // interpreting each pair of characters as a hexadecimal number, and storing these numbers
    // in an array (hash). This is done because hexadecimal numbers are base 16, and can represent 4
    // bits (half a byte) with a single digit. Therefore, two hexadecimal digits represent one byte
    // (8 bits) of data.
    for (let j = 0; j < hashBuffer.length; j += 2) {
      // Convert the hexadecimal representation back into its original binary form.
      // The resulting array will contain the original binary data, with each element
      // representing one byte.
      hash[j / 2] = parseInt(hashBuffer.substring(j, j + 2), 16);
    }

    if (hash[31] === 0) {
      return i;
    } else {
      const j = await work(i + 1);

      return j;
    }
  };

  return await work(0);
};
