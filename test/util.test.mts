import * as util from '../src/util.mjs';
import nock from 'nock';
import {COMMUNITY_BASE_URL} from '../src/constants.mjs';
import {expect, jest, test} from '@jest/globals';

describe('Utils', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    nock.cleanAll();
  });

  it('can get download URL', async () => {
    const target = util.getDownloadUrl(
      '10.11.0',
      'linux',
      'arm64',
      'community'
    );
    expect(target).toBe(
      `${COMMUNITY_BASE_URL}/10.11.0/flyway-commandline-10.11.0-linux-arm64.tar.gz`
    );
  });

  test.each([
    ['latest', '10.11.0'],
    ['10.x', '10.11.0'],
    ['10.5', '10.5.1'],
    ['<10.5', '10.4.1'],
    ['10.5.*', '10.5.1'],
    ['10.9.0', '10.9.0'],
    ['~10.6.1', '10.6.3'],
    ['^10.6.1', '10.11.0']
  ])('resolves version %p to %p', async (requested, expected) => {
    const versions = [
      '10.3.0',
      '10.4.0',
      '10.4.1',
      '10.5.0',
      '10.5.1',
      '10.6.0',
      '10.6.1',
      '10.6.2',
      '10.6.3',
      '10.9.0',
      '10.9.1',
      '10.11.0'
    ];
    const result = util.getSemanticVersion(requested, versions, '10.11.0');
    expect(result).toBe(expected);
  });
});
