import { runAsyncTasksSafely, sleep } from '../../src/helpers/promiseHelper';

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves after the requested delay', async () => {
    const onResolved = jest.fn();

    sleep(250).then(onResolved);

    expect(onResolved).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(249);
    expect(onResolved).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(onResolved).toHaveBeenCalledTimes(1);
  });
});

describe('runAsyncTasksSafely', () => {
  it('waits for all tasks and swallows rejections', async () => {
    const successfulTask = jest.fn().mockResolvedValue('ok');
    const rejectedTask = jest.fn().mockRejectedValue(new Error('failed refresh'));

    await expect(runAsyncTasksSafely([successfulTask, rejectedTask])).resolves.toBeUndefined();

    expect(successfulTask).toHaveBeenCalledTimes(1);
    expect(rejectedTask).toHaveBeenCalledTimes(1);
  });

  it('also swallows synchronous throws', async () => {
    const throwingTask = jest.fn(() => {
      throw new Error('sync failure');
    });

    await expect(runAsyncTasksSafely([throwingTask])).resolves.toBeUndefined();

    expect(throwingTask).toHaveBeenCalledTimes(1);
  });
});
