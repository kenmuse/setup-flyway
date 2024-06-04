import * as httpm from '@actions/http-client';
import {XMLParser} from 'fast-xml-parser';
import * as fs from 'fs';
import * as core from '@actions/core';

import * as constants from './constants.mjs';
import {getMetadataFilePath} from './util.mjs';

/**
 * Interface for the parsed XML metadata file
 */
interface MavenMetadataFile {
  metadata: {
    versioning: {
      release: string;
      versions: {
        version: string[];
      };
    };
  };
}

/**
 * Extracted metadata record
 */
export type VersionMetadata = {
  latest: string;
  availableVersions: string[];
};

/**
 * Retrieves the available versions of the tool from the metadata file.
 * @param metadataUrl the URL of the metadata file
 * @returns the available and latest versions of the tool
 */
export async function getAvailableVersions(
  metadataUrl: string
): Promise<VersionMetadata> {
  const content = await getToolVersionsFile(metadataUrl);
  return parseMetadata(content);
}

/**
 * Parses the Maven metadata content to resolve the available versions.
 * @param content the content of the metadata file
 * @returns the version metadata
 */
async function parseMetadata(content: string): Promise<VersionMetadata> {
  const parser = new XMLParser();
  const xml = parser.parse(content) as MavenMetadataFile;
  const versioning = xml.metadata.versioning;
  const latest = versioning.release;
  const versions = versioning.versions.version;
  return {latest, availableVersions: versions};
}

/**
 * Retrieves the metadata contents from the cache. If the cached copy is not available,
 * it will download the metadata file and cache it.
 * @param edition the edition of the tool
 * @param metadataUrl the URL of the metadata file
 * @returns the contents of the metadata file
 */
async function getToolVersionsFile(edition: string) {
  const metadataUrl =
    edition === 'enterprise' || edition === 'team'
      ? constants.ENTERPRISE_METADATA_URL
      : constants.COMMUNITY_METADATA_URL;
  core.debug(`Using metadata endpoint: ${metadataUrl}`);
  const contents =
    (await readMetadataFile(edition)) ??
    (await downloadAndCacheToolMetadata(edition, metadataUrl));
  return contents;
}

/**
 * Reads the contents of the cached metadata file.
 * @param edition the edition of the tool
 * @returns the content of the metadata file or null if the file does not exist
 */
async function readMetadataFile(edition: string) {
  const filePath = await getMetadataFilePath(edition);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, {
      encoding: 'utf-8',
      flag: 'r'
    });
  }

  return null;
}

/**
 * Writes the contents to the metadata file cache.
 * @param edition the edition of the tool
 * @param content the metadata content to write to the cache
 */
async function writeMetadataFile(edition: string, content: string) {
  const filePath = await getMetadataFilePath(edition);
  fs.writeFileSync(filePath, content, {encoding: 'utf-8'});
}

/**
 * Downloads the metadata file from the remote server and returns the content.
 * @param metadataUrl the URL of the metadata file
 * @returns A promise that resolves to the content of the metadata file
 * @throws An error if a status of 200 is not returned or the content type is unexpected
 */
async function downloadToolMetadata(metadataUrl: string) {
  const client: httpm.HttpClient = new httpm.HttpClient(constants.USER_AGENT);
  const res: httpm.HttpClientResponse = await client.get(metadataUrl);

  if (res.message.statusCode !== 200) {
    throw new Error(
      `Failed to fetch versions from URL. Status code: ${res.message.statusCode}`
    );
  }

  const contentType = res.message.headers['content-type'];
  if (!isAllowedContentType(contentType)) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  return await res.readBody();
}

function isAllowedContentType(header: string | undefined) {
  const contentType = header?.split(';')[0];
  return contentType === 'application/xml' || contentType === 'text/plain';
}

async function downloadAndCacheToolMetadata(
  edition: string,
  metadataUrl: string
) {
  const content = await downloadToolMetadata(metadataUrl);
  await writeMetadataFile(edition, content);
  return content!;
}

/** Exported values that are only available in a unit test environment */
export const privateExports =
  process.env.NODE_ENV !== 'test'
    ? {}
    : {
        functions: {
          downloadToolMetadata,
          getAvailableVersions,
          isAllowedContentType,
          parseAvailableVersions: parseMetadata,
          readMetadataFile,
          writeMetadataFile
        }
      };
