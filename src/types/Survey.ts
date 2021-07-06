export type ResponseOption = {
  id: string;
  title: Record<string, string | undefined>;
  votesCount: number;
};

export type Survey = {
  id: string;
  title?: Record<string, string | undefined>;
  questionTitle: Record<string, string | undefined>;
  description?: Record<string, string | undefined>;
  date: {
    dateStart: string;
    dateEnd: string;
  };
  responseOptions: ResponseOption[];
  surveyComments: Array<{
    id: string;
    message: string;
  }>;
};
