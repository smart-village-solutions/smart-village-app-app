/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('../../src/config', () => ({
  texts: {
    participationProject: {
      capacity: 'Kapazitaet',
      contact: 'Kontakt',
      date: 'Datum',
      email: 'E-Mail',
      instance: 'Instanz',
      location: 'Ort',
      no: 'Nein',
      organizer: 'Veranstalter',
      phone: 'Telefon',
      registrationRequired: 'Anmeldung erforderlich',
      statistics: 'Statistik',
      status: 'Status',
      tags: 'Tags',
      theme: 'Thema',
      time: 'Uhrzeit',
      type: 'Typ',
      yes: 'Ja'
    }
  }
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORD: 'EVENT_RECORD',
    GENERIC_ITEM: 'GENERIC_ITEM',
    NEWS_ITEM: 'NEWS_ITEM',
    POINT_OF_INTEREST: 'POINT_OF_INTEREST',
    TOUR: 'TOUR'
  }
}));

jest.mock('../../src/types', () => ({
  GenericType: {
    Noticeboard: 'Noticeboard',
    ParticipationProject: 'ParticipationProject'
  }
}));

import {
  formatSpeechDates,
  normalizeSpeechText
} from '../../src/helpers/accessibility/speechTextFormatter';

const { getDetailSpeechItems } = require('../../src/helpers/accessibility/detailSpeechParser');
const { QUERY_TYPES } = require('../../src/queries');

describe('speechTextFormatter helpers', () => {
  it('formats backend date-time strings for speech', () => {
    expect(formatSpeechDates('Erstellt am 2026-03-31 11:09:56 +0200')).toBe(
      'Erstellt am 31.03.2026 11:09 Uhr'
    );
  });

  it('formats dates after removing html from speech text', () => {
    expect(normalizeSpeechText('<p>Gültig bis 2026-03-31</p>')).toBe('Gültig bis 31.03.2026');
  });
});

describe('getDetailSpeechItems', () => {
  it('reads news title only once, includes teaser before body, and omits time from the date', () => {
    const speechItems = getDetailSpeechItems({
      detail: {
        mainTitle: 'Titel der Nachricht',
        publishedAt: '2026-03-31 11:09:56 +0200',
        dataProvider: {
          name: 'Smart Village'
        },
        contentBlocks: [
          {
            title: 'Titel der Nachricht',
            intro: 'Das ist der Teaser.',
            body: '<p>Das ist der Inhalt.</p>'
          }
        ]
      },
      query: QUERY_TYPES.NEWS_ITEM
    });

    expect(speechItems).toEqual([
      { id: 'title', text: 'Titel der Nachricht' },
      { id: 'subtitle', text: 'Smart Village' },
      { id: 'publishedAt', text: '31.03.2026' },
      { id: 'contentBlockIntro-0', text: 'Das ist der Teaser.' },
      { id: 'contentBlockBody-0', text: 'Das ist der Inhalt.' }
    ]);
  });

  it('reads structured participation project details', () => {
    const speechItems = getDetailSpeechItems({
      detail: {
        genericType: 'ParticipationProject',
        title: 'Neuer Stadtpark',
        dataProvider: { name: 'Stadt Magdeburg' },
        publicationDate: '2026-03-31',
        payload: {
          type: 'Dialog',
          theme: 'Stadtentwicklung',
          status: 'Aktiv',
          instance: 'Magdeburg',
          startTime: '10 Uhr',
          endTime: '12 Uhr',
          organizer: 'Stadtplanungsamt',
          contact: 'Projektbüro',
          email: 'projekt@example.org',
          phone: '0391 123456',
          capacity: 120,
          registrationRequired: true,
          statistics: '42 Beiträge',
          tags: ['Park', 'Dialog']
        },
        dates: [{ dateStart: '2026-04-01', dateEnd: '2026-04-02' }],
        locations: [{ name: 'Rathaus' }],
        teaser: 'Ihre Ideen sind gefragt.',
        description: 'Gemeinsam planen wir einen neuen Park.',
        contentBlocks: [{ title: 'Ablauf', body: '<p>Vorstellung und Diskussion.</p>' }]
      },
      query: QUERY_TYPES.GENERIC_ITEM
    });

    expect(speechItems).toEqual([
      { id: 'title', text: 'Neuer Stadtpark' },
      { id: 'dataProvider', text: 'Stadt Magdeburg' },
      { id: 'publishedAt', text: '31.03.2026' },
      { id: 'type', text: 'Typ: Dialog' },
      { id: 'theme', text: 'Thema: Stadtentwicklung' },
      { id: 'status', text: 'Status: Aktiv' },
      { id: 'instance', text: 'Instanz: Magdeburg' },
      { id: 'dateStart', text: 'Datum: 01.04.2026' },
      { id: 'dateEnd', text: '02.04.2026' },
      { id: 'time', text: 'Uhrzeit: 10 Uhr - 12 Uhr' },
      { id: 'location', text: 'Ort: Rathaus' },
      { id: 'organizer', text: 'Veranstalter: Stadtplanungsamt' },
      { id: 'contact', text: 'Kontakt: Projektbüro' },
      { id: 'email', text: 'E-Mail: projekt@example.org' },
      { id: 'phone', text: 'Telefon: 0391 123456' },
      { id: 'capacity', text: 'Kapazitaet: 120' },
      { id: 'registrationRequired', text: 'Anmeldung erforderlich: Ja' },
      { id: 'statistics', text: 'Statistik: 42 Beiträge' },
      { id: 'tags', text: 'Tags: Park, Dialog' },
      { id: 'teaser', text: 'Ihre Ideen sind gefragt.' },
      { id: 'description', text: 'Gemeinsam planen wir einen neuen Park.' },
      { id: 'contentBlockTitle-0', text: 'Ablauf' },
      { id: 'contentBlockBody-0', text: 'Vorstellung und Diskussion.' }
    ]);
  });
});
