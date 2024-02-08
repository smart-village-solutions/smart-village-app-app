import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
  data:
    | { id: number; index: number; selected: boolean; value: string }[]
    | { name: string; placeholder: string }[]
    | {
        status: string;
        matchingStatuses: string[];
        iconName: string;
      }[];
  label?: string;
  name: string;
  placeholder?: string;
  type: string;
  value?: string;
  startDate?: {
    name: string;
    placeholder: string;
  };
  endDate?: {
    name: string;
    placeholder: string;
  };
};

type Props = {
  filterTypes?: FilterTypesProps[];
  setQueryVariables: (data: FilterProps) => void;
};

export const Filter = ({ filterTypes, setQueryVariables }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const {
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<FilterProps>({
    defaultValues: {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      serviceCode: '',
      sort: ''
    }
  });

  const isButtonDisabled = !Object.keys(watch() as Record<string, string>).some((key: string) =>
    watch(key)
  );

  if (!filterTypes?.length) {
    return null;
  }

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
                  control={control}
                  errors={errors}
                  {...item}
                  data={item.data as { name: string; placeholder: string }[]}
                />
              </WrapperVertical>
            )}

            {item.type === FILTER_TYPES.DROPDOWN && item.data?.length && (
              <WrapperVertical style={styles.noPaddingBottom}>
                <DropdownFilter
                  control={control}
                  errors={errors}
                  {...item}
                  data={
                    item.data as { id: number; index: number; selected: boolean; value: string }[]
                  }
                />
              </WrapperVertical>
            )}

            {item.type === FILTER_TYPES.SUE.STATUS && (
              <WrapperVertical style={styles.noPaddingBottom}>
                <StatusFilter
                  control={control}
                  {...item}
                  data={
                    item.data as { status: string; matchingStatuses: string[]; iconName: string }[]
                  }
                />
              </WrapperVertical>
            )}
          </>
        ))}

        <WrapperVertical style={styles.noPaddingBottom}>
          <Button
            disabled={isButtonDisabled}
            title={texts.filter.resetFilter}
            onPress={() => reset()}
          />
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
