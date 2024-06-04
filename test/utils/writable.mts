import {Writable} from 'stream';

/**
 * Implements a writable stream that captures the results as a string buffer.
 */
export class StringWritable extends Writable {
  /**
   * The buffer that captures the stream content.
   */
  buffer: string;
  isClosed: boolean = false;
  path: string;

  constructor() {
    super();
    this.buffer = '';
    this.path = '';
  }

  get pending(): boolean {
    return false;
  }

  get bytesWritten(): number {
    return this.buffer.length;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _write(chunk: any, _: any, next: any) {
    this.buffer += chunk;
    next();
  }

  reset() {
    this.buffer = '';
    this.isClosed = false;
  }

  close() {
    this.isClosed = true;
  }
}
