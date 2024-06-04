import * as fs from 'fs';
import * as path from 'path';
//import { fileURLToPath } from 'url';

import {Fixture} from '../fixtures/index.mjs';

/**
 * Gets the path to a file in the fixtures directory.
 * @param fixture the name of the fixture file
 * @returns the full path to the fixture file
 */
function getFixturePath(...fixture: string[]) {
  //const __filename = fileURLToPath(import.meta.url);
  //const __dirname = path.dirname(__filename);
  return path.join(...[__dirname, '..', 'fixtures', ...fixture]);
}

/**
 * Reads the contents of a fixture file.
 * @param fixture the name of the fixture file
 * @returns the contents of the fixture file
 */
export function loadFixture(...fixture: Fixture[]) {
  return fs.readFileSync(getFixturePath(...fixture), 'utf-8');
}
