// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export const internalReactFormHandleBrand: unique symbol = Symbol(
  '@rabassoft/schema-engine-react/form-handle',
);

export const internalReactDiagnosticsReceiver = Symbol.for(
  '@rabassoft/schema-engine-react/diagnostics-receiver',
);
