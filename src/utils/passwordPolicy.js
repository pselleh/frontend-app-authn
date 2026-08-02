import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import {
  adjacencyGraphs,
  dictionary as commonDictionary,
} from '@zxcvbn-ts/language-common';
import {
  dictionary as englishDictionary,
  translations,
} from '@zxcvbn-ts/language-en';

export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_MIN_SCORE = 3;

const estimator = new ZxcvbnFactory({
  translations,
  graphs: adjacencyGraphs,
  dictionary: {
    ...commonDictionary,
    ...englishDictionary,
  },
});

const normalizeValue = value => String(value || '').trim().toLowerCase();

export function getPasswordUserInputs({
  name = '',
  email = '',
  username = '',
  organizationCode = '',
} = {}) {
  const emailLocalPart = normalizeValue(email).split('@')[0];

  return [
    name,
    email,
    emailLocalPart,
    username,
    organizationCode,
  ]
    .map(normalizeValue)
    .filter(value => value.length >= 3);
}

export function evaluatePassword(password, personalData = {}) {
  const value = String(password || '');
  const userInputs = getPasswordUserInputs(personalData);
  const normalizedPassword = value.toLowerCase();

  const containsPersonalData = userInputs.some(
    input => normalizedPassword.includes(input),
  );

  const strength = value
    ? estimator.check(value, userInputs)
    : {
      score: 0,
      feedback: {
        warning: '',
        suggestions: [],
      },
    };

  const checks = {
    minimumLength: value.length >= PASSWORD_MIN_LENGTH,
    maximumLength: value.length <= PASSWORD_MAX_LENGTH,
    noLeadingOrTrailingWhitespace: value === value.trim(),
    excludesPersonalData: !containsPersonalData,
    sufficientStrength: strength.score >= PASSWORD_MIN_SCORE,
  };

  return {
    checks,
    isValid: Object.values(checks).every(Boolean),
    score: strength.score,
    feedback: strength.feedback || {
      warning: '',
      suggestions: [],
    },
  };
}
