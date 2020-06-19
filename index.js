const pdf = require('pdfjs')
const fs = require('fs')

class PDFMerger {
  constructor () {
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
      this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
    } else if (pages.indexOf('-') >= 0) {
      const span = pages.replace(/ /g, '').split('-')
      this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
    } else {
      console.error('invalid parameter "pages"')
    }
  }

  _addEntireDocument (inputFile) {
    var src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
    var ext = new pdf.ExternalDocument(src)
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
      var writeStream = this.doc.pipe(fs.createWriteStream(fileName))
      await this.doc.end()

      var writeStreamClosedPromise = new Promise((resolve, reject) => {
        try {
          writeStream.on('close', () => resolve())
        } catch (e) {
          reject(e)
        }
      })

      return writeStreamClosedPromise
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = PDFMerger
