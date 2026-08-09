import {
  evaluatePassword,
  PASSWORD_MIN_LENGTH,
} from './passwordPolicy';

describe('password policy', () => {
  test('requires at least 15 characters', () => {
    const belowMinimum = 'a'.repeat(PASSWORD_MIN_LENGTH - 1);
    const atMinimum = 'a'.repeat(PASSWORD_MIN_LENGTH);

    expect(PASSWORD_MIN_LENGTH).toBe(15);
    expect(evaluatePassword(belowMinimum).checks.minimumLength).toBe(false);
    expect(evaluatePassword(atMinimum).checks.minimumLength).toBe(true);
  });
});
