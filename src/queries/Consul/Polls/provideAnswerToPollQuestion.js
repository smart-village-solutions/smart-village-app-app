import gql from 'graphql-tag';

export const PROVIDE_ANSWER_TO_POLL_QUESTION = gql`
  mutation provideAnswerToPollQuestion(
    $pollQuestionId: String!
    $answer: String!
    $token: String!
  ) {
    provideAnswerToPollQuestion(pollQuestionId: $pollQuestionId, answer: $answer, token: $token) {
      id
    }
  }
`;
