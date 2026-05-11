import { shareMessage } from '../../src/helpers/BUS/shareHelper';

describe('BUS share helper', () => {
  it('omits teaser text when it is missing', () => {
    expect(
      shareMessage({
        name: 'Meldebescheinigung'
      })
    ).toContain('[Bürger- und Unternehmensservice] Meldebescheinigung');
    expect(
      shareMessage({
        name: 'Meldebescheinigung'
      })
    ).not.toContain('false');
  });
});
