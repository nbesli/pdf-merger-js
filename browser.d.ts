// Type definitions for pdf-merger-js v5.0.0
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>
//                 Daniel Hammer <https://github.com/danmhammer/>
//                 Lukas Loeffler <https://github.com/LukasLoeffler>

declare module "pdf-merger-js/browser" {
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
    add(inputFile: PdfInput, pages?: string | string[] | number | number[] | undefined | null): Promise<undefined>;
    /**
     * Download the PDF as a file with the given name.
     * The extension ".pdf" is appended automatically.
     *
     * @async
     * @param {string} fileName
     * @returns {Promise<void>}
     */
    save(fileName: string): Promise<void>;
    /**
     * Return the merged PDF as a Uint8Array.
     *
     * @async
     * @returns {Promise<Uint8Array>}
     */
    saveAsBuffer(): Promise<Uint8Array>;
    /**
     * Return the merged PDF as a Blob.
     *
     * @async
     * @returns {Promise<Blob>}
     */
    saveAsBlob(): Promise<Blob>;
    /**
     * Set the metadata of the merged PDF.
     *
     * @async
     * @param {Metadata} metadata
     * @returns {Promise<void>}
     */
    setMetadata(metadata: Metadata): Promise<void>;
  }

  export = PDFMerger;
}

declare type PdfInput = Uint8Array | ArrayBuffer | Blob | URL | File | String | string;

declare interface Metadata {
  producer?: string
  author?: string
  title?: string
  creator?: string
}