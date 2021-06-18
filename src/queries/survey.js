import gql from 'graphql-tag';

export const DETAILED_SURVEY = gql`
  query Surveys($id: ID!) {
    surveys(ids: [$id]) {
      ...surveyFields
    }
  }

  fragment surveyFields on SurveyPoll {
    id
    title
    questionTitle
    description
    responseOptions {
      id
      title
      votesCount
    }
  }
`;

export const SURVEYS = gql`
  query Surveys {
    archived: surveys(archived: true) {
      ...surveyFields
    }
    ongoing: surveys(ongoing: true) {
      ...surveyFields
    }
  }

  fragment surveyFields on SurveyPoll {
    id
    title
    questionTitle
  }
`;
