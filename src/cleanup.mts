/**
 * Entry point of the script, called when the Action is being cleaned up.
 */
async function run() {
  // Nothing to do here
}

// Run the script if it's the main script, but allow import if it's
// used as a module.
if (process.argv[1].endsWith('cleanup.mjs')) {
  run();
}
