export = PDFMerger;
declare class PDFMerger {
    /**
     * Resets the internal PDFDocument.
     * Call this method if you want to start merging a new document.
     *
     * @returns {void}
     */
    reset(): void;
    add(inputFile: any, pages: any): Promise<void>;
    setMetadata(metadata: any): Promise<void>;
    save(fileName: any): Promise<void>;
    saveAsBuffer(): Promise<Buffer>;
    #private;
}
