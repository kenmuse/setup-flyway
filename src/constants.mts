/** Action input - version spec */
export const INPUT_PRODUCT_VERSION = 'version';
/** Action input - architecture */
export const INPUT_PRODUCT_ARCH = 'architecture';
/** Action input - platform */
export const INPUT_PRODUCT_PLATFORM = 'platform';
/** Action input - edition */
export const INPUT_PRODUCT_EDITION = 'edition';

/** Action output - resolved version */
export const OUTPUT_VERSION = 'version';
/** Action output - path containing the executable */
export const OUTPUT_PATH = 'path';

/** The tool name */
export const TOOLNAME = 'flyway';
/** User agent to use for the HTTP downloads */
export const USER_AGENT = 'setup-flyway-action';

/** Base URL for downloading the community edition */
export const COMMUNITY_BASE_URL =
  'https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline';
/** Base URL for downloading the enterprise edition */
export const ENTERPRISE_BASE_URL =
  'https://download.red-gate.com/maven/release/org/flywaydb/enterprise/flyway-commandline';
/** URL for the metadata file containing the available community edition versions */
export const COMMUNITY_METADATA_URL = `${COMMUNITY_BASE_URL}/maven-metadata.xml`;
/** URL for the metadata file containing the available enterprise edition versions */
export const ENTERPRISE_METADATA_URL = `${ENTERPRISE_BASE_URL}/maven-metadata.xml`;
