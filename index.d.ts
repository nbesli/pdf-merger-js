// Type definitions for pdf-merger-js v3.3.2
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>

declare module "pdf-merger-js" {
  class PDFMerger {
    constructor();
    add(inputFile: string | Buffer, pages?: string | string[] | undefined | null): undefined;
    save(fileName: string): Promise<undefined>;
    saveAsBuffer(): Promise<Buffer>;
  }

  export = PDFMerger;
}
