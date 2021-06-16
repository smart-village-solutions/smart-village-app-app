export type Survey = {
  title?: Record<string, string | undefined>;
  questionTitle?: Record<string, string | undefined>;
  description?: Record<string, string | undefined>;
  dates: {
    dateStart: string;
    dateEnd: string;
  };
  responseOptions: Array<{
    title: Record<string, string | undefined>;
    votesCount: number;
  }>;
};
