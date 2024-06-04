import {expect, jest} from '@jest/globals';
import {
  getInputs,
  isAllowedPlatformAndArch,
  Platform,
  Architecture
} from '../src/inputs.mjs';

describe('Inputs', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {...OLD_ENV};
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    process.env = OLD_ENV;
  });

  it('returns current platform if not set', async () => {
    process.env.INPUT_VERSION = '1.2.3';
    process.env.INPUT_ARCHITECTURE = Architecture.X64;
    const inputs = getInputs();
    expect(inputs.platform).toBeTruthy();
  });

  it('returns current architecture if not set', async () => {
    process.env.INPUT_VERSION = '1.2.3';
    process.env.INPUT_PLATFORM = Platform.MACOSX;
    const inputs = getInputs();
    expect(inputs.architecture).toBeTruthy();
  });

  it('returns an error if the version is not specified', async () => {
    import('../src/inputs.mjs').catch(error => {
      expect(error?.message).toBe('Input required and not supplied: version');
    });
  });

  test.each([
    ['windows', 'x64', true],
    ['windows', 'arm64', false],
    ['macosx', 'x64', true],
    ['macosx', 'arm64', true],
    ['linux', 'x64', true],
    ['linux', 'arm64', false]
  ])('allows the platform %p-%p: %p', async (platform, arch, expected) => {
    const result = isAllowedPlatformAndArch(platform, arch);
    expect(result).toBe(expected);
  });
});
