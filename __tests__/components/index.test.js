import { Icon } from '../../src/components';

describe('Icon', () => {
  it('returns Icon', async () => {
    expect(Icon).toMatchSnapshot();
  });
});
