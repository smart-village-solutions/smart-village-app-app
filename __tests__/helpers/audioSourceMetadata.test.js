import { getAudioSourceMetadata } from '../../src/helpers/audioSourceMetadata';

describe('getAudioSourceMetadata', () => {
  it('uses a tour or POI title and image ahead of a generic route title', () => {
    expect(
      getAudioSourceMetadata(
        {
          title: 'Burgenwanderweg: Bad Belzig – Lühnsdorf',
          mediaContents: [
            { contentType: 'audio', sourceUrl: { url: 'https://example.org/audio.mp3' } },
            { contentType: 'image', sourceUrl: { url: 'https://example.org/tour.jpg' } }
          ]
        },
        'Tour'
      )
    ).toEqual({
      title: 'Burgenwanderweg: Bad Belzig – Lühnsdorf',
      imageUrl: 'https://example.org/tour.jpg'
    });
  });

  it('uses the first news content block for the title and image', () => {
    expect(
      getAudioSourceMetadata({
        contentBlocks: [
          {
            title: 'Neue Ausstellung',
            mediaContents: [
              { contentType: 'thumbnail', sourceUrl: { url: 'https://example.org/news.jpg' } }
            ]
          }
        ]
      })
    ).toEqual({ title: 'Neue Ausstellung', imageUrl: 'https://example.org/news.jpg' });
  });

  it('leaves artwork empty when an event has no usable image', () => {
    expect(
      getAudioSourceMetadata(
        { name: 'Sommerfest', mediaContents: [{ contentType: 'image', sourceUrl: { url: '' } }] },
        'Event'
      )
    ).toEqual({ title: 'Sommerfest', imageUrl: undefined });
  });
});
