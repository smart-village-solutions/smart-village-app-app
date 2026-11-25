import React, { ComponentType } from 'react';

import type { IconProps } from '../config';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

type Props = Omit<IconProps, 'color' | 'fillColor' | 'strokeColor'> & {
  icon: ComponentType<IconProps>;
};

// Read context when the action is rendered in the header, not in its owning screen's effect.
export const HeaderIcon = ({ icon: IconComponent, ...props }: Props) => {
  const foreground = useHeaderForeground();

  return <IconComponent {...props} color={foreground} />;
};
