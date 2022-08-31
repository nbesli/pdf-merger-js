// Type definitions for pdf-merger-js v3.4.0
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>
//                 Daniel Hammer <https://github.com/danmhammer/>

declare module "pdf-merger-js/browser" {
  class PDFMerger {
    constructor();
    add(inputFile: string | Uint8Array | ArrayBuffer | Blob | File, pages?: string | string[] | undefined | null): Promise<undefined>;
    save(fileName: string): Promise<undefined>;
    saveAsBuffer(): Promise<Uint8Array>;
    saveAsBlob(): Promise<Blob>;
  }

  export = PDFMerger;
}