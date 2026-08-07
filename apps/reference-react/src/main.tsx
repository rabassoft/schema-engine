// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import './styles.css';

import { createRoot } from 'react-dom/client';
import { ReferenceApplicationRoot } from './reference-application.js';

const host = document.querySelector<HTMLElement>('#root');

if (host === null) throw new Error('Missing React reference root element.');

createRoot(host).render(<ReferenceApplicationRoot />);
