import path from 'path';
import * as fs from 'fs';
import os from 'os';
import * as semver from 'semver';
import * as tc from '@actions/tool-cache';
import * as constants from './constants.mjs';
import {Architecture} from './inputs.mjs';

/**
 * Gets the temporary directory
 * @returns The path to the temporary directory
 */
export function getTempDir() {
  const tempDirectory = process.env.RUNNER_TEMP || os.tmpdir();
  return tempDirectory;
}

/**
 * Download the tool and return the URL and download path.
 * @param version the CLI version
 * @param platform the CLI platform
 * @param architecture the CLI architecture
 * @param edition the CLI edition
 * @returns the path and URL details
 */
export async function downloadTool(
  version: string,
  platform: string,
  architecture: string,
  edition: string
) {
  const downloadUrl = getDownloadUrl(version, platform, architecture, edition);
  const pathToDownload = await tc.downloadTool(downloadUrl);
  return {
    downloadUrl,
    pathToArchive: pathToDownload
  };
}

/**
 * Gets the archive extension for downloads.
 * @param platform the platform
 * @returns the extension
 */
export function getDownloadArchiveExtension(platform: string) {
  const extension = platform === 'windows' ? 'zip' : 'tar.gz';
  return extension;
}

/**
 * Resolves the best version from a specification and set of
 * available versions.
 * @param spec the version specification
 * @param availableVersions the available versions
 * @param latestVersion the latest version
 * @returns the best version
 */
export function getSemanticVersion(
  spec: string,
  availableVersions: string[],
  latestVersion: string
) {
  return spec == 'latest'
    ? latestVersion
    : semver.maxSatisfying(availableVersions, spec);
}

/**
 * Checks if the version is satisfied.
 * @param range The range to check
 * @param version The version to be satisfied
 * @returns the comparison results
 */
export function isVersionSatisfies(range: string, version: string): boolean {
  if (semver.valid(range)) {
    const semRange = semver.parse(range);
    if (semRange && semRange.build?.length > 0) {
      return semver.compareBuild(range, version) === 0;
    }
  }

  return semver.satisfies(version, range);
}

/**
 * Extracts the downloaded tool archive
 * @param archivePath The path to the archive
 * @param extension the extension of the archive
 * @returns the destination path
 */
export async function extractTool(archivePath: string, extension?: string) {
  if (!extension) {
    extension = archivePath.endsWith('.tar.gz')
      ? 'tar.gz'
      : path.extname(archivePath);
    if (extension.startsWith('.')) {
      extension = extension.substring(1);
    }
  }

  switch (extension) {
    case 'tar.gz':
    case 'tar':
      return await tc.extractTar(archivePath);
    case 'zip':
      return await tc.extractZip(archivePath);
    default:
      return await tc.extract7z(archivePath);
  }
}

/**
 * Gets the path to the tool cache
 * @param toolName the tool name
 * @returns The path
 */
export async function getToolCache(toolName: string) {
  const toolcacheRoot = process.env.RUNNER_TOOL_CACHE ?? '';
  const fullPath = path.join(toolcacheRoot, toolName);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }

  return fullPath;
}

/**
 * Gets the local path to the metadata file
 * @param edition The edition of the CLI
 * @returns The path
 */
export async function getMetadataFilePath(edition: string) {
  return path.join(
    await getToolCache(constants.TOOLNAME),
    `${edition}-metadata.xml`
  );
}

/**
 * Ensures that the version is in semver format
 * @param version the version to format
 * @returns A semver formatted version
 */
export function convertVersionToSemver(version: number[] | string) {
  const versionArray = Array.isArray(version) ? version : version.split('.');
  const mainVersion = versionArray.slice(0, 3).join('.');
  return mainVersion;
}

/**
 * Gets the download URL for a specific version of the CLI
 * @param version the version
 * @param platform the OS platform
 * @param arch the architecture
 * @param edition the edition
 * @returns A URL for downloading the CLI
 */
export function getDownloadUrl(
  version: string,
  platform: string,
  arch: string,
  edition: string
) {
  const extension = getDownloadArchiveExtension(platform);
  const baseUrl =
    edition === 'enterprise' || edition === 'team'
      ? constants.ENTERPRISE_BASE_URL
      : constants.COMMUNITY_BASE_URL;
  return arch == Architecture.JAVA
    ? `${baseUrl}/${version}/flyway-commandline-${version}.${extension}`
    : `${baseUrl}/${version}/flyway-commandline-${version}-${platform}-${arch}.${extension}`;
}
