export type Survey = {
  id: string;
  title?: Record<string, string | undefined>;
  questionTitle: Record<string, string | undefined>;
  description?: Record<string, string | undefined>;
  dates: {
    dateStart: string;
    dateEnd: string;
  };
  responseOptions: Array<{
    id: string;
    title: Record<string, string | undefined>;
    votesCount: number;
  }>;
};
