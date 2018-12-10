'use strict'
const pdf = require('pdfjs')
const fs = require('fs')

class pdfMerger {
  constructor (outputFileName) {
    this.outputFileName = outputFileName
    if (this.outputFileName != null && this.checkFileExist(this.outputFileName)) {
      console.log('Warning : Output file already exist and will be replaced.')
    }
    this.doc = new pdf.Document()
  }

  add (fileName, pages) {
    try {
      if (typeof pages === 'undefined' || pages == null) {
        this.addEntireDocument(fileName, pages)
      } else if (Array.isArray(pages)) {
        this.addGivenPages(fileName, pages.join(','))
      } else if (pages.toLowerCase().indexOf('to') !== -1) {
        this.addFromToPage(fileName, pages)
      } else {
        console.log('invalid parameter')
      }
    } catch (error) {
      console.log(error)
    }
  }

  addEntireDocument (fileName) {
    try {
      var src = fs.readFileSync(fileName)
      var ext = new pdf.ExternalDocument(src)
      this.doc.setTemplate(ext)
      this.doc.addPagesOf(ext)
    } catch (error) {
      console.log(error)
    }
  }

  addFromToPage (fileName, pages) {
    try {
      var from = pages.replace(/ /g, '').split('to').map(Number)[0]
      var to = pages.replace(/ /g, '').split('to').map(Number)[1]
      if (typeof from === 'number' && typeof to === 'number' && from > 0 & to > from) {
        for (var i = from; i <= to; i++) {
          var src = fs.readFileSync(fileName)
          var ext = new pdf.ExternalDocument(src)
          this.doc.setTemplate(ext)
          this.doc.addPageOf(i, ext)
        }
      } else {
        console.log('invalid function parameter')
      }
    } catch (error) {
      console.log(error)
    }
  }

  addGivenPages (fileName, pages) {
    try {
      var givenPages = pages.split(',').map(Number)
      if (givenPages.length !== 0) {
        for (var page in givenPages) {
          var src = fs.readFileSync(fileName)
          var ext = new pdf.ExternalDocument(src)
          this.doc.setTemplate(ext)
          this.doc.addPageOf(givenPages[page], ext)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  save (fileName) {
    try {
      this.doc.pipe(fs.createWriteStream(fileName))
      this.doc.end()
    } catch (error) {
      console.log(error)
    }
  }

  checkFileExist (fileName) {
    try {
      if (fileName != null) {
        return fs.existsSync(fileName)
      } else if (this.outputFileName != null) {
        return fs.existsSync(this.outputFileName)
      } else {
        console.log('Warning : Output file name is not provided. The document is saved under the name : output.pdf ')
        return fs.existsSync('output.pdf')
      }
    } catch (error) {
      return false
    }
  }
}

module.exports = pdfMerger
