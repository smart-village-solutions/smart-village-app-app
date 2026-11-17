import { storageHelper } from '../../../src/helpers';
import { withSueLocationTimeout } from '../../../src/helpers/sueReportLocation';
import { areaService } from '../../../src/queries/SUE/areaService';

jest.mock('../../../src/helpers', () => ({
  storageHelper: {
    configurations: jest.fn(async () => ({
      sueConfig: {
        geoMap: { areas: [{ id: 'kiel' }] },
        apiConfig: { areaService: { serverUrl: 'https://area.test', apiKey: 'fixture' } }
      }
    }))
  }
}));

it('passes the same abort signal to both area-service fetches and deduplicates postcodes', async () => {
  const controller = new AbortController();
  const fetchSpy = jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce({ json: async () => ({ rs: 'fixture' }) } as Response)
    .mockResolvedValueOnce({
      json: async () => ({
        values: [{ postalCodes: ['24159'] }, { postalCodes: ['24159', '24103'] }]
      })
    } as Response);
  try {
    expect(await areaService({ signal: controller.signal })).toEqual({
      postalCodes: ['24159', '24103']
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    for (const [, options] of fetchSpy.mock.calls) {
      expect(options).toMatchObject({
        method: 'GET',
        signal: controller.signal,
        headers: { api_key: 'fixture' }
      });
    }
  } finally {
    fetchSpy.mockRestore();
  }
});

it.each(['headers', 'body'])(
  'aborts a timed-out lookup and prevents a late second request (%s)',
  async (stall) => {
    jest.useFakeTimers();
    let finish: (value: unknown) => void = () => {};
    const delayed = new Promise((resolve) => {
      finish = resolve;
    });
    const fetchSpy = jest.spyOn(global, 'fetch');
    if (stall === 'headers') fetchSpy.mockReturnValue(delayed as Promise<Response>);
    else fetchSpy.mockResolvedValue({ json: () => delayed } as Response);
    try {
      const result = withSueLocationTimeout((signal) => areaService({ signal }));
      const rejection = expect(result).rejects.toThrow();
      await jest.advanceTimersByTimeAsync(10_000);
      await rejection;
      expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);

      finish(stall === 'headers' ? { json: async () => ({ rs: 'late' }) } : { rs: 'late' });
      await jest.advanceTimersByTimeAsync(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      fetchSpy.mockRestore();
      jest.useRealTimers();
    }
  }
);

it('starts no fetch if cancellation happens while configuration is loading', async () => {
  const controller = new AbortController();
  const fetchSpy = jest.spyOn(global, 'fetch');
  const configuration = await storageHelper.configurations();
  let finish: (value: unknown) => void = () => {};
  (storageHelper.configurations as jest.Mock).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  try {
    const result = areaService({ signal: controller.signal });
    controller.abort();
    finish(configuration);
    await expect(result).rejects.toThrow('aborted');
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally {
    fetchSpy.mockRestore();
  }
});

it('keeps existing callers without an abort signal working', async () => {
  const fetchSpy = jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce({ json: async () => ({ rs: 'fixture' }) } as Response)
    .mockResolvedValueOnce({ json: async () => ({ values: [] }) } as Response);
  try {
    expect(await areaService()).toEqual({ postalCodes: [] });
  } finally {
    fetchSpy.mockRestore();
  }
});
