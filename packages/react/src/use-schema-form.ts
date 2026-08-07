// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import type {
  ReactControlledFormConfig,
  ReactFormHandle,
} from './contracts.js';
import { ReactFormController } from './internal/controller.js';

export function useSchemaForm<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): ReactFormHandle<TData> {
  const controllerReference = useRef<ReactFormController<TData> | undefined>(
    undefined,
  );
  if (controllerReference.current === undefined)
    controllerReference.current = new ReactFormController<TData>();
  const controller = controllerReference.current;
  const handle = useSyncExternalStore(
    controller.store.subscribe,
    controller.store.getSnapshot,
  );

  useLayoutEffect(() => {
    controller.commit(config);
  });
  useLayoutEffect(
    () => () => {
      controller.cleanup();
    },
    [controller],
  );

  return handle;
}
