import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as constants from './constants.mjs';
import {getInputs} from './inputs.mjs';
import * as metadata from './metadata.mjs';
import {downloadTool, extractTool, getSemanticVersion} from './util.mjs';

/**
 * Entry point of the script, called when the Action is executed
 */
async function run() {
  try {
    const inputs = getInputs();
    const versionSpec = inputs.versionSpec;
    const architecture = inputs.architecture;
    const platform = inputs.platform;
    const edition = inputs.edition;

    core.startGroup(`Installing ${constants.TOOLNAME}`);

    // Get the supported tool versions
    const versionMetadata = await metadata.getAvailableVersions(edition);
    core.info(`Latest version: ${versionMetadata.latest}`);
    core.debug(
      `Available versions: ${versionMetadata.availableVersions.join(', ')}`
    );

    // Resolve the version specification to an available version
    const version = getSemanticVersion(
      versionSpec,
      versionMetadata.availableVersions,
      versionMetadata.latest
    );
    if (version == null) {
      throw Error(`Version specification ${versionSpec} is not available`);
    }

    core.debug(`Resolved ${versionSpec} to version: ${version}`);

    // Does the version already exist?
    let cachedPath = tc.find(
      constants.TOOLNAME,
      `${edition}-${version}`,
      architecture
    );

    if (!cachedPath) {
      // Download file and extract the archive
      const download = await downloadTool(
        version,
        platform,
        architecture,
        edition
      );
      const newPath = await extractTool(
        download.pathToArchive,
        download.downloadUrl.endsWith('.zip') ? 'zip' : 'tar.gz'
      );

      // Can't use the provided path as-is because the Flyway archive contains
      // a single folder with the binaries rather than containing the binaries
      // in the root of the archive.
      const toolPath = path.join(newPath, `flyway-${version}`);

      cachedPath = await tc.cacheDir(
        toolPath,
        constants.TOOLNAME,
        `${edition}-${version}`,
        architecture
      );
    }

    // Update the output
    core.setOutput(constants.OUTPUT_VERSION, version);
    core.setOutput(constants.OUTPUT_PATH, cachedPath);

    // Create an environment variable for the version of the tool
    core.exportVariable(`FLYWAY_HOME_${version}`, cachedPath);

    // Add the tool to the PATH
    core.addPath(cachedPath);

    core.endGroup();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
  }
}

// Run the script if it's the main script, but allow import if it's
// used as a module.
if (process.argv[1].endsWith('index.mjs')) {
  run();
}
