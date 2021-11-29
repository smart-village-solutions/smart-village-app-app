import gql from 'graphql-tag';

export const DETAILED_SURVEY = gql`
  query Surveys($id: ID!) {
    surveys(ids: [$id]) {
      id
      title
      questionTitle
      description
      date {
        id
        dateEnd
        dateStart
      }
      responseOptions {
        id
        title
        votesCount
      }
      comments: surveyComments {
        id
        createdAt
        message
      }
      isMultilingual
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

export const SUBMIT_SURVEY_RESPONSE = gql`
  mutation voteForSurvey($increaseId: ID, $decreaseId: ID) {
    voteForSurvey(increaseId: $increaseId, decreaseId: $decreaseId) {
      statusCode
    }
  }
`;

export const COMMENT_ON_SURVEY = gql`
  mutation commentSurvey($surveyId: ID!, $message: String!) {
    commentSurvey(surveyId: $surveyId, message: $message) {
      statusCode
    }
  }
`;
