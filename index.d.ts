// Type definitions for pdf-merger-js v5.0.0
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>

import { PathLike } from "fs-extra";

declare module "pdf-merger-js" {
  class PDFMerger {
    constructor();
    /**
     * Resets the internal state of the document, to start again.
     *
     * @returns {void}
     */
    reset(): void;
    /**
     * Add pages from a PDF document to the end of the merged document.
     *
     * @async
     * @param {PdfInput} input - a pdf source
     * @param {string | string[] | number | number[] | undefined | null} [pages]
     * @returns {Promise<void>}
     */
    add(inputFile: PdfInput, pages?: string | string[] | number | number[] | undefined | null): Promise<void>;
    /**
     * Save the merged PDF to the given path.
     *
     * @async
     * @param {string | PathLike} fileName
     * @returns {Promise<void>}
     */
    save(fileName: string): Promise<void>;
    /**
     * Return the merged PDF as a Buffer.
     *
     * @async
     * @returns {Promise<Buffer>}
     */
    saveAsBuffer(): Promise<Buffer>;
    /**
     * Set the metadata of the merged PDF.
     *
     * @async
     * @param {Metadata} metadata
     * @returns {Promise<void>}
     */
    setMetadata(metadata: Metadata): Promise<void>;
  }
  export default PDFMerger;
}

declare type PdfInput = Uint8Array | ArrayBuffer | Blob | URL | Buffer | String | PathLike | string;

declare interface Metadata {
  producer?: string
  author?: string
  title?: string
  creator?: string
}
