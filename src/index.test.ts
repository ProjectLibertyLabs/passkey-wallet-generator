import { expect, describe, it, beforeEach } from 'vitest';
import { isValidOrigin, testHelperResetState, testHelperSetState, verifyAndSanitizeURLs } from './index';

beforeEach(() => {
  testHelperResetState();
});
describe('verifyAndSanitizeURLs', () => {
  it('It should throw error if not a valid URL', () => {
    expect(() => verifyAndSanitizeURLs(['sgdjhasgdasjh'])).toThrowError(/Invalid URL:/);
  });

  it('It should sanitize successfully', () => {
    let result = verifyAndSanitizeURLs([' HTTP://localHOST:8080 ']);
    expect(result).toStrictEqual(['http://localhost:8080']);
  });
});

describe('isValidOrigin', () => {
  it('It should return false if not valid', () => {
    expect(isValidOrigin('http://localhost:8080')).equals(false);
  });

  it('It should return true if valid', () => {
    const urls = ['http://localhost:8080'];
    testHelperSetState(urls);
    expect(isValidOrigin(urls[0])).equals(true);
  });
});
