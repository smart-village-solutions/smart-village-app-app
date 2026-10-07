/** @type {import('@expo/fingerprint').Config} */
module.exports = {
  fileHookTransform(source, chunk) {
    if (source.type !== 'contents' || source.id !== 'expoConfig' || chunk == null) return chunk;

    const config = JSON.parse(chunk.toString());
    // This display-only counter changes for every OTA. It does not change native compatibility.
    // Preserve every other config field, including app identity, plugins and native versions.
    if (config.extra) delete config.extra.otaVersion;
    return JSON.stringify(config);
  }
};
