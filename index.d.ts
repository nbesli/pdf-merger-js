// Type definitions for pdf-merger-js v3.0.1
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>

declare module "pdf-merger-js" {
  declare class PDFMerger {
    constructor();
    add(inputFile: string, pages?: string | string[] | undefined | null): undefined;
    save(fileName: string): Promise<undefined>;
  }

  export = PDFMerger;
}
