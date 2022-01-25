import { useContext } from 'react';

import { PermanentFilterContext } from '../PermanentFilterProvider';

export const usePermanentFilter = () => useContext(PermanentFilterContext);
