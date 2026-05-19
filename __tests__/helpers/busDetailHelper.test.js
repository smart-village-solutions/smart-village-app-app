import {
  getBusTopActions,
  getBusVisibleTextBlocks,
  splitBusTextBlocks
} from '../../src/helpers/busDetailHelper';

const KURZTEXT_BLOCK = {
  type: { name: 'Kurztext' },
  text: 'Kurzbeschreibung'
};

const VOLLTEXT_BLOCK = {
  type: { name: 'Volltext' },
  text: 'Ausfuehrliche Beschreibung'
};

const FORMULARE_BLOCK = {
  type: { name: 'Formulare' },
  text: 'Formulare im Akkordeon'
};

const TEASER_BLOCK = {
  type: { name: 'Teaser' },
  text: 'wird nicht angezeigt'
};

const HIDDEN_METADATA_BLOCKS = [
  {
    type: { name: 'Typisierung' },
    text: 'interne Metadaten'
  },
  {
    type: { name: 'Status Katalogeintrag' },
    text: 'interner Status'
  },
  {
    type: { name: 'Status Bibliothekseintrag' },
    text: 'interner Bibliotheksstatus'
  }
];

describe('busDetailHelper', () => {
  it('places online services before forms in the top action area', () => {
    const service = {
      onlineServices: [
        {
          links: [{ url: 'https://example.org/online-1' }],
          name: 'Online-Antrag'
        },
        {
          links: [{ url: 'https://example.org/online-2' }],
          name: 'Status prüfen'
        }
      ],
      organisationalUnits: [
        {
          forms: [
            {
              links: [{ url: 'https://example.org/form-1' }],
              name: 'PDF Formular'
            }
          ]
        }
      ]
    };

    expect(getBusTopActions(service)).toEqual([
      {
        kind: 'onlineService',
        links: [{ url: 'https://example.org/online-1' }],
        name: 'Online-Antrag'
      },
      {
        kind: 'onlineService',
        links: [{ url: 'https://example.org/online-2' }],
        name: 'Status prüfen'
      },
      {
        kind: 'form',
        links: [{ url: 'https://example.org/form-1' }],
        name: 'PDF Formular'
      }
    ]);
  });

  it('keeps form actions even when a form has no explicit name', () => {
    const service = {
      organisationalUnits: [
        {
          forms: [
            {
              links: [{ name: 'PDF herunterladen', url: 'https://example.org/form-1' }]
            }
          ]
        }
      ]
    };

    expect(getBusTopActions(service)).toEqual([
      {
        kind: 'form',
        links: [{ name: 'PDF herunterladen', url: 'https://example.org/form-1' }],
        name: undefined
      }
    ]);
  });

  it('maps only supported communication types for top actions', () => {
    const service = {
      onlineServices: [
        {
          communications: [
            { type: { key: 'WWW' }, value: 'https://example.org/service' },
            { type: { key: 'EMAIL' }, value: 'service@example.org' },
            { type: { key: 'TELEFON' }, value: '+49 30 123456' },
            { type: { key: 'FAX' }, value: '+49 30 999999' }
          ],
          name: 'Digital beantragen'
        }
      ]
    };

    expect(getBusTopActions(service)).toEqual([
      {
        kind: 'onlineService',
        links: [
          { url: 'https://example.org/service' },
          { url: 'mailto:service@example.org' },
          { url: 'tel:+49 30 123456' }
        ],
        name: 'Digital beantragen'
      }
    ]);
  });

  it('keeps the Formulare text block visible in the accordion', () => {
    const textBlocks = [KURZTEXT_BLOCK, FORMULARE_BLOCK, TEASER_BLOCK];

    expect(getBusVisibleTextBlocks({ textBlocks })).toEqual([
      KURZTEXT_BLOCK,
      FORMULARE_BLOCK
    ]);
  });

  it('keeps legacy hidden BUS metadata blocks hidden after unwrapping nested text blocks', () => {
    const textBlocks = [
      {
        type: { name: 'Weiterführende Informationen' },
        textBlock: {
          type: { name: 'Volltext' },
          text: 'Ausfuehrliche Beschreibung'
        }
      },
      KURZTEXT_BLOCK,
      ...HIDDEN_METADATA_BLOCKS
    ];

    expect(getBusVisibleTextBlocks({ textBlocks })).toEqual([KURZTEXT_BLOCK, VOLLTEXT_BLOCK]);
  });

  it('keeps text blocks without a type name visible unless they are explicitly hidden', () => {
    const textBlockWithoutTypeName = {
      text: 'Freitext ohne Typ'
    };

    expect(getBusVisibleTextBlocks({ textBlocks: [KURZTEXT_BLOCK, textBlockWithoutTypeName] })).toEqual([
      KURZTEXT_BLOCK,
      textBlockWithoutTypeName
    ]);
  });

  it('keeps Kurztext and Volltext as the first two accordion blocks', () => {
    const textBlocks = [KURZTEXT_BLOCK, VOLLTEXT_BLOCK, FORMULARE_BLOCK];

    expect(splitBusTextBlocks({ textBlocks })).toEqual({
      firstTextBlocks: [KURZTEXT_BLOCK, VOLLTEXT_BLOCK],
      sortedTextBlocks: [FORMULARE_BLOCK]
    });
  });
});
