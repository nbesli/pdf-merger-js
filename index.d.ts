// Type definitions for pdf-merger-js v5.0.0
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>

import { PathLike } from "fs-extra";

type PdfInput =
  | Uint8Array
  | ArrayBuffer
  | Blob
  | URL
  | Buffer
  | String
  | PathLike
  | string;

interface Metadata {
  producer?: string;
  author?: string;
  title?: string;
  creator?: string;
}

declare class PDFMerger {
  constructor();
  /**
   * Resets the internal state of the document, to start again.
   */
  reset(): void;
  /**
   * Add pages from a PDF document to the end of the merged document.
   */
  add(
    inputFile: PdfInput,
    pages?: string | string[] | number | number[] | undefined | null
  ): Promise<void>;
  /**
   * Save the merged PDF to the given path.
   */
  save(fileName: string): Promise<void>;
  /**
   * Return the merged PDF as a Buffer.
   */
  saveAsBuffer(): Promise<Buffer>;
  /**
   * Set the metadata of the merged PDF.
   */
  setMetadata(metadata: Metadata): Promise<void>;
}

export default PDFMerger;