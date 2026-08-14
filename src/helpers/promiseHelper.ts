export const sleep = async (ms: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const runAsyncTasksSafely = async (tasks: Array<(() => Promise<unknown>) | undefined>) => {
  await Promise.all(
    tasks.map((task) =>
      Promise.resolve()
        .then(() => task?.())
        .catch(() => undefined)
    )
  );
};
