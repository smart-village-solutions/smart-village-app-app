// Only an authentication failure can be repaired by replacing credentials.
// In particular, malformed JSON, timeouts and HTTP 5xx must not trigger token refresh.
export const queryWithAuthRetry = async <T>(
  query: () => Promise<T>,
  refreshAuth: () => Promise<unknown>
): Promise<T> => {
  try {
    return await query();
  } catch (error) {
    if ((error as { networkError?: { statusCode?: number } })?.networkError?.statusCode !== 401) {
      throw error;
    }

    await refreshAuth();
    return query();
  }
};
