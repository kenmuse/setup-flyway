import * as core from '@actions/core';
import os from 'os';
import * as constants from './constants.mjs';

/**
 * The allowed product editions
 * */
export enum Edition {
  COMMUNITY = 'community',
  ENTERPRISE = 'enterprise'
}

/**
 * The allowed platforms
 * */
export enum Architecture {
  X64 = 'x64',
  ARM64 = 'arm64',
  JAVA = 'java'
}

/**
 * The allowed platforms
 * */
export enum Platform {
  WINDOWS = 'windows',
  MACOSX = 'macosx',
  LINUX = 'linux',
  LINUX_ALPINE = 'linux-alpine'
}

/**
 * Represents the strongly-typed user-provided
 * inputs for the action.
 */
export interface Inputs {
  versionSpec: string;
  architecture: string;
  platform: string;
  edition: string;
}

/**
 * Get the user-provided inputs for the action.
 * @returns The user-provided inputs
 */
export function getInputs(): Inputs {
  // Get the user-provided input containing the version specification
  const versionSpec = core.getInput(constants.INPUT_PRODUCT_VERSION, {
    required: true
  });

  // Get the user-provided input containing the architecture (arm64, x64, java)
  const architecture = getInputWithDefault(
    constants.INPUT_PRODUCT_ARCH,
    Architecture,
    getArch
  );

  // Get the user-provided input containing the platform (windows, macosx, linux)
  const platform = getInputWithDefault(
    constants.INPUT_PRODUCT_PLATFORM,
    Platform,
    getPlatform
  );

  const edition = getInputWithDefault(
    constants.INPUT_PRODUCT_EDITION,
    Edition,
    () => Edition.COMMUNITY
  );

  // Don't output during Jest tests
  if (process.env.NODE_ENV !== 'test') {
    core.debug(
      `Inputs: version: ${versionSpec}, architecture: ${architecture}, platform: ${platform}, edition: ${edition}`
    );
  }

  if (!isAllowedPlatformAndArch(platform, architecture)) {
    throw Error(`Unsupported platform: ${platform}-${architecture}`);
  }

  return {versionSpec, architecture, platform, edition} as Inputs;
}

/**
 * Reads the named input and returns its configured value,
 * using the provided resolver if the input is not set.
 * @param input name of the input to read
 * @param type the enum type of the input
 * @param resolve function that returns a string if the input is not set
 * @returns the resolved input value
 */
function getInputWithDefault<TEnum>(
  input: string,
  type: TEnum,
  resolve: () => string
): string {
  const raw = core.getInput(input);
  if (raw == null || (typeof raw === 'string' && raw.trim().length === 0)) {
    return resolve();
  }

  const value = type[raw.toUpperCase() as keyof typeof type];
  if (!value) {
    throw Error(`Unrecognized input value: ${raw}`);
  }

  return value as string;
}

/**
 * Gets the current OS platform (Windows, MacOS, Linux)
 * @returns the current OS platform
 */
export function getPlatform(): string {
  const platform = process.platform;
  switch (platform) {
    case 'darwin':
      return 'macosx';
    case 'win32':
      return 'windows';
    case 'linux':
      // TODO: Detect Alpine
      return 'linux';
    default:
      throw Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Gets the current OS architecture
 * @returns the architecture
 */
export function getArch(): string {
  const arch = os.arch();
  switch (arch) {
    case 'x64':
      return 'x64';
    case 'amd64':
      return 'x64';
    case 'ia32':
      return 'x64';
    case 'arm64':
      return 'arm64';
    default:
      throw Error(`Unsupported architecture: ${arch}`);
  }
}

/**
 * Ensures the platform and architecture combination is supported
 * @param platform the OS platform name
 * @param arch the OS architecture name
 * @returns true if the platform and architecture are supported
 */
export function isAllowedPlatformAndArch(
  platform: string,
  arch: string
): boolean {
  const signature = `${platform}-${arch}`;
  return (
    arch == Architecture.JAVA ||
    [
      'windows-x64',
      'linux-x64',
      'macosx-arm64',
      'macosx-x64',
      'linux-alpine-x64'
    ].includes(signature)
  );
}
