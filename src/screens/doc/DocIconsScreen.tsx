import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { BoldText, RegularText } from '../../components';
import { colors, Icon, normalize } from '../../config';
import { iconMappings } from '../../config/icons/mappings';
import { IconLibrary } from '../../IconProvider';

type TIconItem = {
  iconName: string;
  mappedName: string;
  library: IconLibrary;
};

const IconItem = ({ iconName, mappedName, library }: TIconItem) => (
  <View style={styles.iconContainer}>
    <Icon.NamedIcon name={mappedName} iconSet={library} size={normalize(32)} />
    <RegularText smallest style={styles.iconNameText}>
      {iconName}
    </RegularText>
    <RegularText smallest style={styles.mappedNameText}>
      → {mappedName}
    </RegularText>
  </View>
);

type TIconSection = {
  library: IconLibrary;
  isExpanded: boolean;
  onToggle: () => void;
};

const IconSection = ({ library, isExpanded, onToggle }: TIconSection) => {
  const mapping = iconMappings[library];
  const iconCount = Object.keys(mapping).length;

  if (iconCount === 0) return null;

  const data = Object.entries(mapping).map(([unifiedName, mappedName]) => ({
    iconName: unifiedName,
    mappedName: mappedName as string,
    library
  }));

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderContent}>
          <BoldText lightest>{library}</BoldText>
          <RegularText lightest smallest>
            ({iconCount} icons)
          </RegularText>
        </View>
        <Icon.NamedIcon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={normalize(20)}
          color={colors.lightestText}
        />
      </TouchableOpacity>
      {isExpanded && (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <IconItem
              iconName={item.iconName}
              mappedName={item.mappedName}
              library={item.library}
            />
          )}
          keyExtractor={(item) => `${item.library}-${item.iconName}`}
          numColumns={3}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export const DocIconsScreen = () => {
  const [expandedSections, setExpandedSections] = useState<Set<IconLibrary>>(new Set(['tabler']));

  const toggleSection = (library: IconLibrary) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(library)) {
        newSet.delete(library);
      } else {
        newSet.add(library);
      }
      return newSet;
    });
  };

  // Sort libraries to show tabler first
  const sortedLibraries = Object.keys(iconMappings).sort((a, b) => {
    if (a === 'tabler') return -1;
    if (b === 'tabler') return 1;
    return a.localeCompare(b);
  }) as IconLibrary[];

  return (
    <ScrollView style={styles.container}>
      {sortedLibraries.map((library) => (
        <IconSection
          key={library}
          library={library}
          isExpanded={expandedSections.has(library)}
          onToggle={() => toggleSection(library)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flex: 1
  },
  section: {
    marginBottom: normalize(16)
  },
  sectionHeader: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomColor: colors.gray20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: normalize(16)
  },
  sectionHeaderContent: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: normalize(8)
  },
  iconContainer: {
    alignItems: 'center',
    flex: 1,
    margin: normalize(9),
    padding: normalize(8)
  },
  iconNameText: {
    marginTop: normalize(4),
    textAlign: 'center'
  },
  mappedNameText: {
    fontSize: normalize(10),
    marginTop: normalize(2),
    opacity: 0.6,
    textAlign: 'center'
  }
});
