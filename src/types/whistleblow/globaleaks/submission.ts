export type GlobaleaksSubmission = {
  context_id: string;
  answers: {
    [key: string]: {
      required_status: boolean;
      value: string;
    }[];
  };
  identity_provided: boolean;
  receivers: string[];
  score: number;
};
