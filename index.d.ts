// Type definitions for pdf-merger-js v3.4.0
// Project: https://github.com/nbesli/pdf-merger-js
// Definitions by: Alexander Wunschik <https://github.com/mojoaxel/>

declare module "pdf-merger-js" {
  class PDFMerger {
    constructor();
    add(inputFile: string | Buffer | ArrayBuffer, pages?: string | string[] | undefined | null): Promise<undefined>;
    save(fileName: string): Promise<undefined>;
    saveAsBuffer(): Promise<Buffer>;
    setMetadata(metadata: Metadata): Promise<void>;
  }
  export = PDFMerger;
}


declare interface Metadata {
  producer?: string
  author?: string
  title?: string
  creator?: string
}
