// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only
//
// The validators in this file are adapted from ajv-formats 3.0.1
// (Copyright (c) 2020 Evgeny Poberezkin, MIT License). Only the three formats
// selected by SPEC-010 are retained in this browser-safe ESM module.

import type { Format } from 'ajv';

const EMAIL =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
const DATE_TIME_SEPARATOR = /t|\s/i;

export const selectedFormats: Readonly<
  Record<'email' | 'date' | 'date-time', Format>
> = Object.freeze({
  email: EMAIL,
  date: validateDate,
  'date-time': validateDateTime,
});

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function validateDate(value: string): boolean {
  const matches = DATE.exec(value);
  if (matches === null) return false;
  const year = Number(matches[1]);
  const month = Number(matches[2]);
  const day = Number(matches[3]);
  const maximumDay = month === 2 && isLeapYear(year) ? 29 : (DAYS[month] ?? 0);
  return month >= 1 && month <= 12 && day >= 1 && day <= maximumDay;
}

function validateTime(value: string): boolean {
  const matches = TIME.exec(value);
  if (matches === null) return false;
  const hour = Number(matches[1]);
  const minute = Number(matches[2]);
  const second = Number(matches[3]);
  const timezone = matches[4];
  const timezoneSign = matches[5] === '-' ? -1 : 1;
  const timezoneHour = Number(matches[6] ?? 0);
  const timezoneMinute = Number(matches[7] ?? 0);
  if (timezone === undefined || timezoneHour > 23 || timezoneMinute > 59) {
    return false;
  }
  if (hour <= 23 && minute <= 59 && second < 60) return true;
  const utcMinute = minute - timezoneMinute * timezoneSign;
  const utcHour = hour - timezoneHour * timezoneSign - (utcMinute < 0 ? 1 : 0);
  return (
    (utcHour === 23 || utcHour === -1) &&
    (utcMinute === 59 || utcMinute === -1) &&
    second < 61
  );
}

function validateDateTime(value: string): boolean {
  const parts = value.split(DATE_TIME_SEPARATOR);
  return (
    parts.length === 2 &&
    parts[0] !== undefined &&
    parts[1] !== undefined &&
    validateDate(parts[0]) &&
    validateTime(parts[1])
  );
}
