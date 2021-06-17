import gql from 'graphql-tag';

export const DETAILED_SURVEY = gql`
  query Surveys($id: ID!) {
    surveys(ids: [$id]) {
      all {
        ...surveyFields
      }
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
    surveys {
      active {
        ...surveyFields
      }
      archived {
        ...surveyFields
      }
    }
  }

  fragment surveyFields on SurveyPoll {
    id
    title
    questionTitle
  }
`;
