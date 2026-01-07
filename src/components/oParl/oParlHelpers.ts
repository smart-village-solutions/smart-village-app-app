import { texts } from '../../config';
import { AgendaItemPreviewData, OrganizationPreviewData } from '../../types';

export const getOrganizationNameString = (organization?: OrganizationPreviewData) => {
  if (!organization) return texts.oparl.organization.organization;

  const { classification, name, shortName } = organization;

  return name || shortName || classification || texts.oparl.organization.organization;
};

export const getSortedAgendaItems = (agendaItems?: AgendaItemPreviewData[]) => {
  if (!agendaItems) return;

  // Check if all items have the order property
  const hasOrder = agendaItems.every((item) => typeof item.order === 'number');

  // If order property exists, sort by order
  if (hasOrder) {
    return [...agendaItems].sort((a, b) => a.order - b.order);
  }

  // Otherwise, use the complex number-based sorting
  const romanToInt = (romanNumber: string): number | null => {
    const romanNumbers: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000
    };
    let result = 0;
    let previous = 0;

    for (let i = romanNumber.length - 1; i >= 0; i--) {
      const current = romanNumbers[romanNumber[i]];

      if (!current) return null;

      if (current < previous) {
        result -= current;
      } else {
        result += current;
      }

      previous = current;
    }

    return result;
  };

  const isRoman = (value: string) =>
    /^[IVXLCDM]+$/i.test(value) && romanToInt(value.toUpperCase()) !== null;

  const parseParts = (number?: string | number): (number | null)[] => {
    return String(number ?? '')
      .split('.')
      .map((n) => {
        const parsed = parseInt(n, 10);

        if (!isNaN(parsed)) return parsed;

        const lower = n.toLowerCase();

        if (/^[a-z]$/.test(lower)) {
          return lower.charCodeAt(0) - 'a'.charCodeAt(0) + 1; // a → 1, b → 2, ...
        }

        return romanToInt(n.toUpperCase()) ?? null;
      });
  };

  const [romanItems, otherItems] = (agendaItems ?? []).reduce(
    ([romans, others], item) => {
      const firstPart = String(item.number ?? '').split('.')[0];
      return isRoman(firstPart) ? [[...romans, item], others] : [romans, [...others, item]];
    },
    [[], []] as [AgendaItemPreviewData[], AgendaItemPreviewData[]]
  );

  const sortFn = (a: AgendaItemPreviewData, b: AgendaItemPreviewData) => {
    const aParts = parseParts(a.number);
    const bParts = parseParts(b.number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aValue = aParts[i] ?? 0;
      const bValue = bParts[i] ?? 0;

      if (aValue !== bValue) {
        return (aValue ?? 0) - (bValue ?? 0);
      }
    }

    return 0;
  };

  return [...romanItems.sort(sortFn), ...otherItems.sort(sortFn)];
};
