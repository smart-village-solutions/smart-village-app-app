type CategoryReference = { id: string | number; name?: string };
type Category = CategoryReference & {
  parent?: CategoryReference | null;
  children?: Category[];
  pointsOfInterestTreeCount?: number;
  toursTreeCount?: number;
};
type Resource = {
  id: string | number;
  visible?: boolean | null;
  category?: CategoryReference | null;
  categories?: CategoryReference[] | null;
};
type Catalogue = {
  categories: Category[];
  categoryHierarchy: Category[];
  categoryPointsOfInterest: Resource[];
  categoryTours: Resource[];
};

const resourceCounts = (resources: Resource[], hierarchy: Category[]) => {
  const byId = new Map(hierarchy.map((category) => [String(category.id), category]));
  const byName = new Map(hierarchy.map((category) => [category.name, String(category.id)]));
  const resourcesByCategory = new Map<string, Set<string>>();

  resources.forEach((resource) => {
    if (resource.visible === false) return;
    const visited = new Set<string>();
    const categories = [
      ...(resource.categories || []),
      ...(resource.category ? [resource.category] : [])
    ];
    categories.forEach((category) => {
      let id = byId.has(String(category.id))
        ? String(category.id)
        : category.name
        ? byName.get(category.name)
        : undefined;
      while (id && !visited.has(id)) {
        visited.add(id);
        const members = resourcesByCategory.get(id) || new Set<string>();
        members.add(String(resource.id));
        resourcesByCategory.set(id, members);
        const parent = byId.get(id)?.parent;
        id = parent ? String(parent.id) : undefined;
      }
    });
  });

  return resourcesByCategory;
};

// The root resource queries have the same publication/role/location scope as the POI and tour lists.
// Only version-filtered resources are passed here; server aggregate counts include restricted records.
export const projectCategoryAvailability = <T>(data: T): T => {
  if (!data || typeof data !== 'object' || !('categories' in data)) return data;
  if (!('categoryHierarchy' in data)) return data;
  const catalogue = data as unknown as Catalogue;
  if (
    !Array.isArray(catalogue.categories) ||
    !Array.isArray(catalogue.categoryHierarchy) ||
    !Array.isArray(catalogue.categoryPointsOfInterest) ||
    !Array.isArray(catalogue.categoryTours)
  ) {
    return { ...data, categories: [] };
  }

  const hierarchy = new Map(
    catalogue.categoryHierarchy.map((category) => [String(category.id), category])
  );
  const connectChildren = (categories: Category[], parent?: Category) => {
    categories.forEach((category) => {
      const existing = hierarchy.get(String(category.id));
      if (parent && !hierarchy.has(String(existing?.parent?.id))) {
        hierarchy.set(String(category.id), { ...category, parent: { id: parent.id } });
      }
      connectChildren(category.children || [], category);
    });
  };
  connectChildren(catalogue.categories);
  const allCategories = [...hierarchy.values()];
  const pois = resourceCounts(catalogue.categoryPointsOfInterest, allCategories);
  const tours = resourceCounts(catalogue.categoryTours, allCategories);
  const project = (categories: Category[]): Category[] =>
    categories.flatMap((category) => {
      const id = String(category.id);
      const pointsOfInterestTreeCount = pois.get(id)?.size || 0;
      const toursTreeCount = tours.get(id)?.size || 0;
      if (!pointsOfInterestTreeCount && !toursTreeCount) return [];
      return [
        {
          ...category,
          pointsOfInterestTreeCount,
          toursTreeCount,
          ...(category.children && { children: project(category.children) })
        }
      ];
    });
  return { ...data, categories: project(catalogue.categories) };
};
