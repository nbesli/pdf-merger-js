const pdf = require('pdfjs')
const fs = require('fs')

class PDFMerger {
  constructor (outputFileName) {
    this.outputFileName = outputFileName
    if (this.outputFileName != null && this._checkFileExist(this.outputFileName)) {
      console.log('Warning : Output file already exist and will be replaced.')
    }
    this.doc = new pdf.Document()
  }

  add (inputFile, pages) {
    if (typeof pages === 'undefined' || pages === null) {
      this._addEntireDocument(inputFile, pages)
    } else if (Array.isArray(pages)) {
      this._addGivenPages(inputFile, pages)
    } else if (pages.indexOf(',') > 0) {
      this._addGivenPages(inputFile, pages.replace(/ /g, '').split(','))
    } else if (pages.toLowerCase().indexOf('to') >= 0) {
      const span = pages.replace(/ /g, '').split('to')
      this._addFromToPage(inputFile, span[0], span[1])
    } else if (pages.indexOf('-') >= 0) {
      const span = pages.replace(/ /g, '').split('-')
      this._addFromToPage(inputFile, span[0], span[1])
    } else {
      console.log('invalid parameter')
    }
  }

  _addEntireDocument (inputFile) {
    var src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
    var ext = new pdf.ExternalDocument(src)
    this.doc.setTemplate(ext)
    this.doc.addPagesOf(ext)
  }

  _addFromToPage (inputFile, from, to) {
    if (typeof from === 'number' && typeof to === 'number' && from > 0 && to > from) {
      for (var i = from; i <= to; i++) {
        var src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
        var ext = new pdf.ExternalDocument(src)
        this.doc.setTemplate(ext)
        this.doc.addPageOf(i, ext)
      }
    } else {
      console.log('invalid function parameter')
    }
  }

  _addGivenPages (inputFile, pages) {
    if (pages.length > 0) {
      for (var page in pages) {
        var src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
        var ext = new pdf.ExternalDocument(src)
        this.doc.setTemplate(ext)
        this.doc.addPageOf(pages[page], ext)
      }
    }
  }

  async save (fileName) {
    try {
      this.doc.pipe(fs.createWriteStream(fileName))
      await this.doc.end()
    } catch (error) {
      console.log(error)
    }
  }

  _checkFileExist (fileName) {
    try {
      if (fileName) {
        return fs.existsSync(fileName)
      } else if (this.outputFileName) {
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

module.exports = PDFMerger
