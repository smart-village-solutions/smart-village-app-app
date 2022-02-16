import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const myTasks = () => [
  {
    id: 1,
    title: 'Termin finden',
    routeName: 'VolunteerDetail',
    description: 'Wann?',
    tags: 'Testspace',
    checklist: [
      {
        id: 9,
        task_id: 7,
        title: 'Punkt 1',
        description: null,
        completed: 0,
        sort_order: 0
      },
      {
        id: 10,
        task_id: 7,
        title: 'Punkt 2',
        description: null,
        completed: 0,
        sort_order: 0
      }
    ],
    assigned_users: [
      {
        id: 5,
        guid: 'c8afbeb8-2041-4424-a9d5-84204652243e',
        display_name: 'Daniel Molnar',
        url: 'http://humhub.herzbergdigitalvereint.de/u/dm%2Bhdvt%40tpwd.de/'
      }
    ],
    params: {
      title: texts.detailTitles.volunteer.task,
      query: QUERY_TYPES.VOLUNTEER.TASKS,
      queryVariables: { id: 1 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];
