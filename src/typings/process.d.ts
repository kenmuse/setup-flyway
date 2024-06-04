/**
 * Define the configuration values that are available in the environment.
 */
declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      INPUT_VERSION?: string;
      INPUT_ARCHITECTURE?: string;
      INPUT_PLATFORM?: string;
      RUNNER_TEMP?: string;
      RUNNER_TOOL_CACHE?: string;
    }
  }
}

export {};
