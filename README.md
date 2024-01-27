# Description

This node.js library can **merge multiple PDF documents**, or parts of them, to one new PDF document. You can do this by using the **command line interface** or from within your **node.js** or even directly in the **browser**.

The only dependency is [pdf-lib](https://pdf-lib.js.org/) so it can run in any javascript-only environment **without any non-javascript dependencies**.

## Legacy notes

* If you are searching for the legacy version based on [pdfjs](https://www.npmjs.com/package/pdfjs) please install a [v3 release](https://github.com/nbesli/pdf-merger-js/releases?q=v3&expanded=true). Since [v4](https://github.com/nbesli/pdf-merger-js/releases?q=v4&expanded=true) we use [pdf-lib](https://pdf-lib.js.org/) instead.
* If you are searching for a legacy version using CommonJS modules please install a [v4 release](https://github.com/nbesli/pdf-merger-js/releases?q=v4&expanded=true). Since [v5](https://github.com/nbesli/pdf-merger-js/releases?q=v5&expanded=true) we use the modern ESM ("import") instead of the CommonJS ("require) module standard.

## Installation

`npm install --save pdf-merger-js`

or simply do a global installation if you just want to use the cli tool:

`npm install -g pdf-merger-js`

## Usage

### CLI "pdf-merge"

```txt
Usage: pdf-merge [options] <inputFiles...>

merge multiple PDF documents, or parts of them, to a new PDF document

Options:
  -V, --version              output the version number
  -o, --output <outputFile>  Merged PDF output file path
  -v, --verbose              Print verbose output
  -s, --silent               do not print any output to stdout. Overwrites --verbose
  -h, --help                 display help for command

```

#### Example calls

Merge pages 1-2 from the first input with pages 1,2 and 5-7 from the second pdf document:

`pdf-merge --output ./merged.pdf ./input1.pdf#1-2 ./input2.pdf#1,2,5-7`

Get two pdf files from the an url and merge the first one with pages 2-3 from the second one:

`pdf-merge --verbose --output ./sample.pdf Testfile.pdf https://pdfobject.com/pdf/sample.pdf https://upload.wikimedia.org/wikipedia/commons/1/13/Example.pdf#2-3`

### node.js

The node.js version has the following export functions:

* `saveAsBuffer` exports a merged pdf as an [Buffer](https://nodejs.org/api/buffer.html).
* `save` saves the pdf under the given filename.
* `setMetadata` set Metadata for producer, author, title or creator.
* `reset` resets the internal state of the document, to start again.

#### async node.js example

```js
import PDFMerger from 'pdf-merger-js';

var merger = new PDFMerger();

(async () => {
  await merger.add('pdf1.pdf');  //merge all pages. parameter is the path to file and filename.
  await merger.add('pdf2.pdf', 2); // merge only page 2
  await merger.add('pdf2.pdf', [1, 3]); // merge the pages 1 and 3
  await merger.add('pdf2.pdf', '4, 7, 8'); // merge the pages 4, 7 and 8
  await merger.add('pdf3.pdf', '3 to 5'); //merge pages 3 to 5 (3,4,5)
  await merger.add('pdf3.pdf', '3-5'); //merge pages 3 to 5 (3,4,5)

  // Set metadata
  await merger.setMetadata({
    producer: "pdf-merger-js based script",
    author: "John Doe",
    creator: "John Doe",
    title: "My live as John Doe"
  });

  await merger.save('merged.pdf'); //save under given name and reset the internal document
  
  // Export the merged PDF as a nodejs Buffer
  // const mergedPdfBuffer = await merger.saveAsBuffer();
  // fs.writeSync('merged.pdf', mergedPdfBuffer);
})();
```

### Browser

The Browser version has the following export functions:

* `saveAsBuffer` exports a merged pdf as an [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).
* `saveAsBlob` exports a merged pdf as a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
* `save` starts a file-download directly in the browser.
* `setMetadata` set Metadata for producer, author, title or creator.
* `reset` resets the internal state of the document, to start again.

#### async react example

```jsx
import PDFMerger from 'pdf-merger-js/browser';
import React, { useEffect, useState } from 'react';

// files: Array of PDF File or Blob objects
const Merger = (files) => {
  const [mergedPdfUrl, setMergedPdfUrl] = useState();

  useEffect(() => {
    const render = async () => {
      const merger = new PDFMerger();

      for(const file of files) {
        await merger.add(file);
      }

      await merger.setMetadata({
        producer: "pdf-merger-js based script"
      });

      const mergedPdf = await merger.saveAsBlob();
      const url = URL.createObjectURL(mergedPdf);

      return setMergedPdfUrl(url);
    };

    render().catch((err) => {
      throw err;
    });

    () => setMergedPdfUrl({});
  }, [files, setMergedPdfUrl]);

  return !data ? (
    <>Loading</>
  ) : (
    <iframe
      height={1000}
      src={`${mergedPdfUrl}`}
      title='pdf-viewer'
      width='100%s'
    ></iframe>
  );
};
```

## Similar libraries

* This library is inspired by the [PHP library PDFMerger](https://github.com/myokyawhtun/PDFMerger) and has a very similar API.
* [pdf-merge](https://www.npmjs.com/package/pdf-merge) has a dependency on [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/).
* [easy-pdf-merge](https://www.npmjs.com/package/easy-pdf-merge) has a dependency on the [Apache PDFBox® - A Java PDF Library](https://pdfbox.apache.org/).
* [pdfmerge](https://www.npmjs.com/package/pdfmerge) has a dependency on python and [PyPDF2](https://pythonhosted.org/PyPDF2/).
