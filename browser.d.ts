// Type definitions for pdf-merger-js v3.3.2
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>
//                 Daniel Hammer <https://github.com/danmhammer/>

declare module "pdf-merger-js/browser" {
  class PDFMerger {
    constructor();
    add(inputFile: string | ArrayBuffer | Blob | Buffer | File, pages?: string | string[] | undefined | null): Promise<undefined>;
    save(fileName: string): Promise<undefined>;
    saveAsBuffer(): Promise<Buffer>;
    saveAsBlob(): Promise<Blob>;
  }

  export = PDFMerger;
}