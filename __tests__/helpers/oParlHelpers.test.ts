import {
  getSortedAgendaItems,
  getOrganizationNameString
} from '../../src/components/oParl/oParlHelpers';
import { AgendaItemPreviewData, OParlObjectType, OrganizationPreviewData } from '../../src/types';

// Test helpers to create valid test objects with required type field
const createAgendaItem = (partial: Partial<AgendaItemPreviewData>): AgendaItemPreviewData => ({
  id: '',
  type: OParlObjectType.AgendaItem,
  ...partial
});

const createOrganization = (
  partial: Partial<OrganizationPreviewData>
): OrganizationPreviewData => ({
  id: '',
  type: OParlObjectType.Organization,
  ...partial
});

describe('getOrganizationNameString', () => {
  it('returns default text when organization is undefined', () => {
    expect(getOrganizationNameString(undefined)).toBe('Gruppierung');
  });

  it('returns name when available', () => {
    const org = createOrganization({
      id: '1',
      name: 'City Council',
      shortName: 'CC',
      classification: 'Council'
    });
    expect(getOrganizationNameString(org)).toBe('City Council');
  });

  it('returns shortName when name is not available', () => {
    const org = createOrganization({
      id: '1',
      shortName: 'CC',
      classification: 'Council'
    });
    expect(getOrganizationNameString(org)).toBe('CC');
  });

  it('returns classification when name and shortName are not available', () => {
    const org = createOrganization({
      id: '1',
      classification: 'Council'
    });
    expect(getOrganizationNameString(org)).toBe('Council');
  });

  it('returns default text when all properties are empty', () => {
    const org = createOrganization({
      id: '1'
    });
    expect(getOrganizationNameString(org)).toBe('Gruppierung');
  });
});

describe('getSortedAgendaItems', () => {
  describe('when input is undefined or empty', () => {
    it('returns undefined when input is undefined', () => {
      expect(getSortedAgendaItems(undefined)).toBeUndefined();
    });

    it('returns empty array when input is empty', () => {
      expect(getSortedAgendaItems([])).toEqual([]);
    });
  });

  describe('order-based sorting (new behavior)', () => {
    it('sorts items by order property when all items have order', () => {
      const items = [
        createAgendaItem({ id: '3', name: 'Third', order: 3 }),
        createAgendaItem({ id: '1', name: 'First', order: 1 }),
        createAgendaItem({ id: '2', name: 'Second', order: 2 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted).toEqual([
        createAgendaItem({ id: '1', name: 'First', order: 1 }),
        createAgendaItem({ id: '2', name: 'Second', order: 2 }),
        createAgendaItem({ id: '3', name: 'Third', order: 3 })
      ]);
    });

    it('sorts items with order 0 correctly', () => {
      const items = [
        createAgendaItem({ id: '2', name: 'Second', order: 2 }),
        createAgendaItem({ id: '0', name: 'Zero', order: 0 }),
        createAgendaItem({ id: '1', name: 'First', order: 1 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted?.[0]).toEqual(createAgendaItem({ id: '0', name: 'Zero', order: 0 }));
    });

    it('sorts items with negative orders correctly', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'One', order: 1 }),
        createAgendaItem({ id: '-2', name: 'Minus Two', order: -2 }),
        createAgendaItem({ id: '-1', name: 'Minus One', order: -1 }),
        createAgendaItem({ id: '0', name: 'Zero', order: 0 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted).toEqual([
        createAgendaItem({ id: '-2', name: 'Minus Two', order: -2 }),
        createAgendaItem({ id: '-1', name: 'Minus One', order: -1 }),
        createAgendaItem({ id: '0', name: 'Zero', order: 0 }),
        createAgendaItem({ id: '1', name: 'One', order: 1 })
      ]);
    });

    it('maintains stable sort with duplicate order values', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', order: 1 }),
        createAgendaItem({ id: '2', name: 'Second', order: 2 }),
        createAgendaItem({ id: '3', name: 'Third', order: 2 }),
        createAgendaItem({ id: '4', name: 'Fourth', order: 3 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted?.[0].order).toBe(1);
      expect(sorted?.[1].order).toBe(2);
      expect(sorted?.[2].order).toBe(2);
      expect(sorted?.[3].order).toBe(3);
      // Original order should be preserved for duplicates
      expect(sorted?.[1].id).toBe('2');
      expect(sorted?.[2].id).toBe('3');
    });

    it('handles large order values', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', order: 1000000 }),
        createAgendaItem({ id: '2', name: 'Second', order: 999999 }),
        createAgendaItem({ id: '3', name: 'Third', order: 1000001 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted?.[0].order).toBe(999999);
      expect(sorted?.[1].order).toBe(1000000);
      expect(sorted?.[2].order).toBe(1000001);
    });

    it('handles decimal order values correctly', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', order: 1.5 }),
        createAgendaItem({ id: '2', name: 'Second', order: 1.2 }),
        createAgendaItem({ id: '3', name: 'Third', order: 2.1 })
      ];

      const sorted = getSortedAgendaItems(items);
      expect(sorted?.[0].order).toBe(1.2);
      expect(sorted?.[1].order).toBe(1.5);
      expect(sorted?.[2].order).toBe(2.1);
    });

    it('does not modify the original array', () => {
      const items = [
        createAgendaItem({ id: '3', name: 'Third', order: 3 }),
        createAgendaItem({ id: '1', name: 'First', order: 1 }),
        createAgendaItem({ id: '2', name: 'Second', order: 2 })
      ];

      const original = [...items];
      getSortedAgendaItems(items);

      expect(items).toEqual(original);
    });
  });

  describe('fallback sorting (number-based when order is missing)', () => {
    describe('numeric numbers', () => {
      it('sorts simple numeric numbers correctly', () => {
        const items = [
          createAgendaItem({ id: '3', name: 'Third', number: '3' }),
          createAgendaItem({ id: '1', name: 'First', number: '1' }),
          createAgendaItem({ id: '2', name: 'Second', number: '2' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['1', '2', '3']);
      });

      it('sorts multi-level numeric numbers correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item 1.2.1', number: '1.2.1' }),
          createAgendaItem({ id: '2', name: 'Item 1.1', number: '1.1' }),
          createAgendaItem({ id: '3', name: 'Item 1.2', number: '1.2' }),
          createAgendaItem({ id: '4', name: 'Item 1.10', number: '1.10' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['1.1', '1.2', '1.2.1', '1.10']);
      });
    });

    describe('roman numerals', () => {
      it('sorts roman numerals correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item V', number: 'V' }),
          createAgendaItem({ id: '2', name: 'Item I', number: 'I' }),
          createAgendaItem({ id: '3', name: 'Item X', number: 'X' }),
          createAgendaItem({ id: '4', name: 'Item III', number: 'III' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['III', 'I', 'V', 'X']);
      });

      it('sorts lowercase roman numerals correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item v', number: 'v' }),
          createAgendaItem({ id: '2', name: 'Item i', number: 'i' }),
          createAgendaItem({ id: '3', name: 'Item iii', number: 'iii' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['iii', 'i', 'v']);
      });

      it('sorts complex roman numerals correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item XL', number: 'XL' }), // 40
          createAgendaItem({ id: '2', name: 'Item IX', number: 'IX' }), // 9
          createAgendaItem({ id: '3', name: 'Item XC', number: 'XC' }), // 90
          createAgendaItem({ id: '4', name: 'Item IV', number: 'IV' }), // 4
          createAgendaItem({ id: '5', name: 'Item XLIV', number: 'XLIV' }) // 44
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['IV', 'IX', 'XL', 'XLIV', 'XC']);
      });

      it('places roman numeral items before others', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item 1', number: '1' }),
          createAgendaItem({ id: '2', name: 'Item II', number: 'II' }),
          createAgendaItem({ id: '3', name: 'Item 2', number: '2' }),
          createAgendaItem({ id: '4', name: 'Item I', number: 'I' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['II', 'I', '1', '2']);
      });
    });

    describe('alphabetic numbers', () => {
      it('sorts single letter numbers correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item c', number: '1.c' }),
          createAgendaItem({ id: '2', name: 'Item a', number: '1.a' }),
          createAgendaItem({ id: '3', name: 'Item b', number: '1.b' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['1.a', '1.b', '1.c']);
      });

      it('treats lowercase letters as numbers (a=1, b=2, etc.)', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item 1.z', number: '1.z' }),
          createAgendaItem({ id: '2', name: 'Item 1.a', number: '1.a' }),
          createAgendaItem({ id: '3', name: 'Item 1.m', number: '1.m' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['1.a', '1.m', '1.z']);
      });
    });

    describe('mixed number formats', () => {
      it('sorts mixed numeric and alphabetic correctly', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item 1.2.a', number: '1.2.a' }),
          createAgendaItem({ id: '2', name: 'Item 1.1', number: '1.1' }),
          createAgendaItem({ id: '3', name: 'Item 1.2', number: '1.2' }),
          createAgendaItem({ id: '4', name: 'Item 1.2.c', number: '1.2.c' }),
          createAgendaItem({ id: '5', name: 'Item 1.2.b', number: '1.2.b' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual([
          '1.1',
          '1.2',
          '1.2.a',
          '1.2.b',
          '1.2.c'
        ]);
      });
    });

    describe('edge cases for fallback sorting', () => {
      it('handles items without number property', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item without number' }),
          createAgendaItem({ id: '2', name: 'Item 1', number: '1' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted).toHaveLength(2);
        // Items without numbers should be treated as having parts [0]
      });

      it('handles empty string numbers', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item empty', number: '' }),
          createAgendaItem({ id: '2', name: 'Item 1', number: '1' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted).toHaveLength(2);
      });

      it('handles numbers with different part lengths', () => {
        const items = [
          createAgendaItem({ id: '1', name: 'Item 1.1.1.1', number: '1.1.1.1' }),
          createAgendaItem({ id: '2', name: 'Item 1.1', number: '1.1' }),
          createAgendaItem({ id: '3', name: 'Item 1.1.1', number: '1.1.1' })
        ];

        const sorted = getSortedAgendaItems(items);
        expect(sorted?.map((item) => item.number)).toEqual(['1.1', '1.1.1', '1.1.1.1']);
      });

      it('does not modify original array in fallback sorting', () => {
        const items = [
          createAgendaItem({ id: '3', name: 'Third', number: '3' }),
          createAgendaItem({ id: '1', name: 'First', number: '1' }),
          createAgendaItem({ id: '2', name: 'Second', number: '2' })
        ];

        const original = [...items];
        getSortedAgendaItems(items);

        expect(items).toEqual(original);
      });
    });
  });

  describe('mixed scenarios', () => {
    it('uses order-based sorting only when ALL items have order', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', number: '3', order: 1 }),
        createAgendaItem({ id: '2', name: 'Second', number: '1' }), // Missing order
        createAgendaItem({ id: '3', name: 'Third', number: '2', order: 3 })
      ];

      const sorted = getSortedAgendaItems(items);
      // Should use fallback sorting by number
      expect(sorted?.map((item) => item.number)).toEqual(['1', '2', '3']);
    });

    it('treats order: 0 as a valid order value', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', order: 0 }),
        createAgendaItem({ id: '2', name: 'Second', order: 1 }),
        createAgendaItem({ id: '3', name: 'Third', order: 2 })
      ];

      const sorted = getSortedAgendaItems(items);
      // All have order (including 0), so should use order-based sorting
      expect(sorted?.[0].order).toBe(0);
      expect(sorted?.[1].order).toBe(1);
      expect(sorted?.[2].order).toBe(2);
    });

    it('falls back to number sorting when order is undefined for any item', () => {
      const items = [
        createAgendaItem({ id: '1', name: 'First', number: '2', order: undefined }),
        createAgendaItem({ id: '2', name: 'Second', number: '1', order: 2 })
      ];

      const sorted = getSortedAgendaItems(items);
      // Should use fallback sorting
      expect(sorted?.map((item) => item.number)).toEqual(['1', '2']);
    });
  });
});
