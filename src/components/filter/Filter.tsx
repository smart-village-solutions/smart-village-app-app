import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-elements';

import { Icon, consts, device, normalize, texts } from '../../config';

import { Button } from './../Button';
import { BoldText } from './../Text';
import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { StatusFilter } from './Sue';

const { FILTER_TYPES, a11yLabel } = consts;

type FilterProps = {
  endDate: string;
  serviceCode: string;
  sort: string;
  startDate: string;
  status: string;
};

type FilterTypesProps = {
  data: { selected: boolean; value: string }[];
  label?: string;
  name: string;
  placeholder?: string;
  type: string;
  value?: string;
  valueKey: string;
  displayKey?: string;
  startDate: {
    name: string;
    placeholder: string;
  };
  endDate: {
    name: string;
    placeholder: string;
  };
};

type Props = {
  filterData?: FilterProps;
  filterTypes?: FilterTypesProps[];
  onPress?: () => void;
  setQueryVariables: (data: FilterProps) => void;
  style?: StyleProp<ViewStyle>;
};

export const Filter = ({ setQueryVariables, filterTypes }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm<FilterProps>({
    defaultValues: {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      serviceCode: '',
      sort: ''
    }
  });

  if (!filterTypes?.length) {
    return null;
  }

  const onFilter = async (filterData: FilterProps) => {
    setQueryVariables(filterData);
    reset();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        accessibilityLabel={a11yLabel.editIcon}
        accessibilityHint={a11yLabel.editHint}
        style={styles.button}
      >
        <BoldText smallest primary>
          {isCollapsed ? texts.filter.showFilter : texts.filter.hideFilter}
        </BoldText>
        <Icon.Filter size={normalize(24)} style={styles.icon} />
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed}>
        {filterTypes.map((item) => (
          <>
            {item.type === FILTER_TYPES.DATE && (
              <WrapperVertical style={styles.noPaddingBottom}>
                <DateFilter
                  containerStyle={{ width: device.width / normalize(2) }}
                  item={item}
                  control={control}
                  errors={errors}
                />
              </WrapperVertical>
            )}

            {item.type === FILTER_TYPES.DROPDOWN && (
              <WrapperVertical style={styles.noPaddingBottom}>
                <DropdownFilter
                  control={control}
                  data={item.data}
                  errors={errors}
                  label={item.label}
                  name={item.name}
                  placeholder={item.placeholder}
                  valueKey={item.valueKey}
                  displayKey={item.displayKey}
                />
              </WrapperVertical>
            )}

            {item.type === FILTER_TYPES.SUE.STATUS && (
              <WrapperVertical style={styles.noPaddingBottom}>
                <StatusFilter
                  name={item.name}
                  control={control}
                  errors={errors}
                  data={item.value}
                  label={item.label}
                />
              </WrapperVertical>
            )}
          </>
        ))}

        <WrapperVertical style={styles.noPaddingBottom}>
          <Button title={texts.filter.resetFilter} onPress={handleSubmit(onFilter)} />
        </WrapperVertical>
        <Divider />
      </Collapsible>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  icon: {
    paddingLeft: normalize(12)
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
