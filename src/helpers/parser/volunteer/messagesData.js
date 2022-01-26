import { consts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const myMessages = () => [
  {
    id: 1,
    title: 'Philipp Wilimzig',
    tags: 'Ping',
    subject: 'Ping',
    routeName: 'VolunteerDetail',
    messages: [
      {
        text: 'Pong',
        date: '06.01.2022',
        time: '11:46',
        sender: 'Philipp Wilimzig'
      },
      {
        text: 'Tennis',
        date: '26.01.2022',
        time: '19:40',
        sender: 'Daniel Molnar'
      },
      {
        text:
          'Oder Basketball, was natürlich alles sehr schöne Sportarten sind. Darüber muss gesprochen werden.',
        date: '26.01.2022',
        time: '19:43',
        sender: 'Daniel Molnar'
      }
    ],
    params: {
      title: 'Ping - Philipp Wilimzig',
      query: QUERY_TYPES.VOLUNTEER.MESSAGES,
      queryVariables: { id: 1 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  {
    id: 2,
    title: 'Philipp Wilimzig, Marco Metz',
    multiple: true,
    tags: 'Nachricht an mehrere Leute',
    subject: 'Nachricht an mehrere Leute',
    routeName: 'VolunteerDetail',
    messages: [
      {
        text: 'Hallo Test 123',
        date: '14.01.2022',
        time: '18:23',
        sender: 'Daniel Molnar'
      },
      {
        text: 'Hallo',
        date: '17.01.2022',
        time: '08:12',
        sender: 'Philipp Wilimzig'
      },
      {
        text: 'Hallo ebenso',
        date: '18.01.2022',
        time: '07:53',
        sender: 'Marco Metz'
      }
    ],
    params: {
      title: 'Nachricht an mehrere Leute - Philipp Wilimzig, Marco Metz',
      query: QUERY_TYPES.VOLUNTEER.MESSAGES,
      queryVariables: { id: 2 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];
