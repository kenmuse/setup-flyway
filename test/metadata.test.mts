import fs from 'fs';
import nock from 'nock';
import {URL} from 'url';
import {expect, jest, test} from '@jest/globals';
import type {SpyInstance} from 'jest-mock';

import {privateExports} from '../src/metadata.mjs';
import {
  ENTERPRISE_METADATA_URL,
  COMMUNITY_METADATA_URL
} from '../src/constants.mjs';
import {loadFixture} from './utils/fixtures.mjs';
import {getMetadataFilePath} from '../src/util.mjs';

describe('Metadata module', () => {
  const metadataContent = loadFixture('maven.xml');
  const metadata = privateExports.functions!;

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
  });

  test.each([
    ['community', COMMUNITY_METADATA_URL],
    ['enterprise', ENTERPRISE_METADATA_URL]
  ])(
    'should loads remote metadata from %s endpoint',
    async (edition, metaDataUrl) => {
      const url = new URL(metaDataUrl);
      const scope = nock(url.origin)
        .get(url.pathname)
        .reply(200, metadataContent, {
          'Content-Type': 'text/plain'
        });

      /*
    let writeSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    let mockWriteStream = new StringWritable();
    let writeStreamSpy = jest.spyOn(fs, 'createWriteStream').mockImplementation(() => {
      mockWriteStream.reset();
      return mockWriteStream;
    });*/

      const versions = await metadata.downloadToolMetadata(metaDataUrl);
      expect(versions).toBe(metadataContent);
      expect(scope.isDone()).toBe(true);
    }
  );

  it('parses the versions', async () => {
    //let writeSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    //let readSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(fileData);
    const meta = await metadata.parseAvailableVersions(metadataContent);
    expect(meta.latest).toBe('10.11.0');
    expect(meta.availableVersions).toHaveLength(18);
  });

  it('reads the cache file', async () => {
    const edition = 'community';
    const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true;
    });
    const readSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(metadataContent);

    const meta = await metadata.readMetadataFile(edition);
    expect(meta).toBe(metadataContent);
    expect(readSyncSpy.mock.calls[0][0]).toBe(
      await getMetadataFilePath(edition)
    );
    expect(existsSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('writes the metadata file', async () => {
    const edition = 'community';
    const writeSyncSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});
    const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true;
    });
    await metadata.writeMetadataFile(edition, metadataContent);

    // It should attempt to write a file
    expect(writeSyncSpy.mock.calls).toHaveLength(1);

    // It should attempt to write a file to the expected path
    expect(writeSyncSpy.mock.calls[0][0]).toBe(
      await getMetadataFilePath(edition)
    );

    // It should attempt to write the expected content
    expect(writeSyncSpy.mock.calls[0][1]).toBe(metadataContent);

    // It should have checked whether the folder for the file exists
    expect(existsSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  test.each([
    ['application/xml', true],
    ['application/xml;charset=UTF-8', true],
    ['text/plain', true],
    ['application/json', false],
    ['text/html', false]
  ])('allows content type %p: %p', (contentType, result) => {
    expect(metadata.isAllowedContentType(contentType)).toBe(result);
  });
});

describe('metadata write', () => {
  const metadataContent = loadFixture('maven.xml');
  const metadata = privateExports.functions!;
  const edition = 'community';
  let writeSyncSpy: SpyInstance<any>;
  let existsSpy: SpyInstance<any>;
  beforeEach(async () => {
    writeSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true;
    });
    await metadata.writeMetadataFile(edition, metadataContent);
  });

  it('writes the metadata file', async () => {
    expect(writeSyncSpy.mock.calls).toHaveLength(1);
  });

  it('uses the expected path', async () => {
    expect(writeSyncSpy.mock.calls[0][0]).toBe(
      await getMetadataFilePath(edition)
    );
  });

  it('writes the expected content', () => {
    expect(writeSyncSpy.mock.calls[0][1]).toBe(metadataContent);
  });

  it('checks whether the folder for the file exists', () => {
    expect(existsSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
