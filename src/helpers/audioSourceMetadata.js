const isImage = (mediaContent) =>
  mediaContent?.contentType === 'image' || mediaContent?.contentType === 'thumbnail';

const getArtworkUrl = (mediaContents) =>
  mediaContents?.find(
    (mediaContent) =>
      isImage(mediaContent) && /^https?:\/\//i.test(mediaContent.sourceUrl?.url || '')
  )?.sourceUrl.url;

export const getAudioSourceMetadata = (detail, fallbackTitle) => ({
  title:
    detail?.title ||
    detail?.name ||
    detail?.mainTitle ||
    detail?.contentBlocks?.[0]?.title ||
    fallbackTitle ||
    '',
  imageUrl:
    getArtworkUrl(detail?.mediaContents) ||
    detail?.contentBlocks?.map((block) => getArtworkUrl(block?.mediaContents)).find(Boolean)
});
