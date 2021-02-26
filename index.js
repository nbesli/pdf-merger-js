const pdf = require('pdfjs')
const fs = require('fs')

class PDFMerger {
  constructor () {
    this._resetDoc()
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

  _resetDoc () {
    if (this.doc) {
      delete this.doc
    }
    this.doc = new pdf.Document()
  }

  _addEntireDocument (inputFile) {
    const src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
    const ext = new pdf.ExternalDocument(src)
    this.doc.addPagesOf(ext)
  }

  _addFromToPage (inputFile, from, to) {
    if (typeof from === 'number' && typeof to === 'number' && from > 0 && to > from) {
      for (let i = from; i <= to; i++) {
        const src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
        const ext = new pdf.ExternalDocument(src)
        this.doc.setTemplate(ext)
        this.doc.addPageOf(i, ext)
      }
    } else {
      console.log('invalid function parameter')
    }
  }

  _addGivenPages (inputFile, pages) {
    if (pages.length > 0) {
      for (const page in pages) {
        const src = (inputFile instanceof Buffer) ? inputFile : fs.readFileSync(inputFile)
        const ext = new pdf.ExternalDocument(src)
        this.doc.setTemplate(ext)
        this.doc.addPageOf(pages[page], ext)
      }
    }
  }

  async save (fileName) {
    try {
      const writeStream = this.doc.pipe(fs.createWriteStream(fileName))
      await this.doc.end()
      this._resetDoc()

      const writeStreamClosedPromise = new Promise((resolve, reject) => {
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

  async saveAsBuffer () {
    return this.doc.asBuffer()
  }
}

module.exports = PDFMerger
