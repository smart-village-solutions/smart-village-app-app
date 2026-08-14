import _sortBy from 'lodash/sortBy';

const TEXT_BLOCKS_SORTER = {
  Kurztext: 0,
  Volltext: 1,
  Ansprechpartner: 2,
  'Erforderliche Unterlagen': 3,
  Voraussetzungen: 4,
  Bearbeitungsdauer: 5,
  Verfahrensablauf: 6,
  Formulare: 7,
  Fristen: 8,
  'Kosten (Gebühren, Auslagen, etc.)': 9,
  'Rechtsgrundlage(n)': 10,
  'Hinweise (Besonderheiten)': 11,
  Urheber: 12,
  'Weiterführende Informationen': 13,
  Ansprechpunkt: 14,
  'Zuständige Stelle': 15
};

const HIDDEN_TEXT_BLOCKS = new Set([
  'TEASER',
  'FACHLICH FREIGEGEBEN DURCH',
  'FACHLICH FREIGEGEBEN AM',
  'TYPISIERUNG',
  'STATUS KATALOGEINTRAG',
  'STATUS BIBLIOTHEKSEINTRAG'
]);

const FIRST_TEXT_BLOCKS = new Set(['KURZTEXT', 'VOLLTEXT']);
const COMMUNICATION_PROTOCOLS = {
  EMAIL: 'mailto:',
  TELEFON: 'tel:',
  WWW: ''
};

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const getActionName = (action) =>
  action?.name || action?.title || action?.publicName || action?.label || action?.description;

const getActionLinks = (action) => {
  const directLinks = toArray(action?.links).map((link) => ({
    name: getActionName(link),
    url: link?.url || link?.href || link?.uri
  }));
  const urlLinks = [action?.url, action?.href, action?.uri, action?.portalLink]
    .filter(Boolean)
    .map((url) => ({ url }));
  const communicationLinks = toArray(action?.communications)
    .map((communication) => {
      const protocol = COMMUNICATION_PROTOCOLS[communication?.type?.key];
      const value = communication?.value?.trim();

      if (!value || protocol === undefined) {
        return null;
      }

      return {
        url: `${protocol}${value}`
      };
    })
    .filter(Boolean);

  return [...directLinks, ...urlLinks, ...communicationLinks].filter((link) => !!link.url);
};

const normalizeTopAction = (action, kind) => {
  const name = getActionName(action);
  const links = getActionLinks(action);

  if (!links.length || (!name && kind !== 'form')) {
    return null;
  }

  return {
    kind,
    links,
    name
  };
};

const getTopLevelOnlineServices = (service = {}) => {
  return [
    ...toArray(service.onlineServices),
    ...toArray(service.onlinedienste),
    ...toArray(service.onlineDienste),
    ...toArray(service.onlineDienstleistungen)
  ];
};

export const getBusTopActions = (service = {}) => {
  const onlineServices = getTopLevelOnlineServices(service)
    .map((onlineService) => normalizeTopAction(onlineService, 'onlineService'))
    .filter(Boolean);
  const forms = toArray(service.forms)
    .map((form) => normalizeTopAction(form, 'form'))
    .filter(Boolean);

  return [...onlineServices, ...forms];
};

export const getBusVisibleTextBlocks = (service = {}) => {
  return _sortBy(
    toArray(service.textBlocks).map((textBlock) => textBlock?.textBlock || textBlock),
    (textBlock) => {
      return TEXT_BLOCKS_SORTER[textBlock?.type?.name];
    }
  ).filter((textBlock) => {
    const typeName = textBlock?.type?.name?.toUpperCase();

    return !typeName || !HIDDEN_TEXT_BLOCKS.has(typeName);
  });
};

export const splitBusTextBlocks = (service = {}) => {
  const visibleTextBlocks = getBusVisibleTextBlocks(service);

  return {
    firstTextBlocks: visibleTextBlocks.filter((textBlock) =>
      FIRST_TEXT_BLOCKS.has(textBlock?.type?.name?.toUpperCase())
    ),
    sortedTextBlocks: visibleTextBlocks.filter(
      (textBlock) => !FIRST_TEXT_BLOCKS.has(textBlock?.type?.name?.toUpperCase())
    )
  };
};
