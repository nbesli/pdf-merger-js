# Description


This package is developed only for test purposes. It is developed for merging pdf documents. All the functionalities build on [pdfjs](https://www.npmjs.com/package/pdfjs) package. 


# Installation
`npm i pdf-merger-trvl --save`

# Code sample

```javascript
const pdfMerger=require('pdf-merger-trvl');


var merger=new pdfMerger();

merger.add('pdf1.pdf');  //merge all pages. parameter is the path to file and filename.
merger.add('pdf2.pdf', [2]); // merge only page 2
merger.add('pdf3.pdf', '1to2'); //merge pages 1 to 2
merger.add('pdf2.pdf', [1,3]); // merge the pages 1 and 3
merger.save('merged.pdf'); //save under given name 

```
