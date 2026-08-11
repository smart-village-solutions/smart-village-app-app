import {
  filterCreateContentTilesByRoles,
  filterProfileEditorialTiles,
  groupCreateContentTiles,
  hasEditorialRoles
} from '../../src/helpers/profileEditorialContentHelper';
import { ScreenName } from '../../src/types';

const createRoles = (overrides = {}) => ({
  role_construction_site: false,
  role_deadlines: false,
  role_defect_report: false,
  role_encounter_support: false,
  role_event_record: false,
  role_job: false,
  role_lunch: false,
  role_news_item: false,
  role_noticeboard: false,
  role_offer: false,
  role_point_of_interest: false,
  role_push_notification: false,
  role_static_contents: false,
  role_survey: false,
  role_tour_stops: false,
  role_tour: false,
  role_voucher: false,
  role_waste_calendar: false,
  ...overrides
});

const createTiles = () => [
  { routeName: 'Detail', params: { query: 'noticeboard' }, title: 'Anzeige' },
  { routeName: 'Detail', params: { query: 'newsItem' }, title: 'Nachricht' },
  { routeName: 'Detail', params: { query: 'pointOfInterest' }, title: 'Ort' },
  { routeName: 'Detail', params: { query: 'eventRecord' }, title: 'Veranstaltung' }
];

describe('profileEditorialContentHelper', () => {
  it('detects editorial users via editorial roles', () => {
    expect(hasEditorialRoles(createRoles())).toBe(false);
    expect(hasEditorialRoles(createRoles({ role_news_item: true }))).toBe(true);
  });

  it('keeps noticeboard tiles visible for non-editor create-content users', () => {
    const filteredTiles = filterCreateContentTilesByRoles(
      createTiles(),
      createRoles()
    );

    expect(filteredTiles.map((tile) => tile.title)).toEqual(['Anzeige']);
  });

  it('groups create-content tiles into noticeboard and editorial sections', () => {
    const groupedTiles = groupCreateContentTiles(
      createTiles(),
      createRoles({
        role_noticeboard: true,
        role_news_item: true,
        role_point_of_interest: true,
        role_event_record: true
      })
    );

    expect(groupedTiles.noticeboardTiles.map((tile) => tile.title)).toEqual(['Anzeige']);
    expect(groupedTiles.editorialTiles.map((tile) => tile.title)).toEqual([
      'Nachricht',
      'Ort',
      'Veranstaltung'
    ]);
  });

  it('detects noticeboard tiles when they are modeled as genericItems with Noticeboard generic type', () => {
    const groupedTiles = groupCreateContentTiles(
      [
        {
          routeName: 'Detail',
          params: {
            query: 'genericItems',
            queryVariables: {
              genericType: 'Noticeboard'
            }
          },
          title: 'Anzeige'
        }
      ],
      createRoles({ role_noticeboard: true })
    );

    expect(groupedTiles.noticeboardTiles.map((tile) => tile.title)).toEqual(['Anzeige']);
    expect(groupedTiles.editorialTiles).toEqual([]);
  });

  it('detects noticeboard tiles when they come through routeName or title based static content', () => {
    const groupedTiles = groupCreateContentTiles(
      [
        {
          routeName: ScreenName.NoticeboardForm,
          title: 'Anzeige'
        }
      ],
      createRoles({ role_noticeboard: true })
    );

    expect(groupedTiles.noticeboardTiles.map((tile) => tile.title)).toEqual(['Anzeige']);
  });

  it('hides editorial profile tiles for non-editors', () => {
    const filteredTiles = filterProfileEditorialTiles(
      [
        { routeName: ScreenName.ProfileContent, title: 'Meine Inhalte' },
        { routeName: ScreenName.ProfileCreateContentHome, title: 'Neuen Inhalt erstellen' },
        { routeName: ScreenName.Noticeboard, title: 'Meine Anzeigen' }
      ],
      createRoles({ role_noticeboard: true })
    );

    expect(filteredTiles.map((tile) => tile.title)).toEqual(['Meine Anzeigen']);
  });
});
