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

  add (fileName, pages) {
    try {
      if (typeof pages === 'undefined' || pages == null) {
        this._addEntireDocument(fileName, pages)
      } else if (Array.isArray(pages)) {
        this._addGivenPages(fileName, pages)
      } else if (pages.toLowerCase().indexOf(',') >= 0) {
        this._addGivenPages(fileName, pages.split(','))
      } else if (pages.toLowerCase().indexOf('to') >= 0) {
        const span = pages.replace(/ /g, '').split('to')
        this._addFromToPage(fileName, span[0], span[1])
      } else if (pages.toLowerCase().indexOf('-') >= 0) {
        const span = pages.replace(/ /g, '').split('-')
        this._addFromToPage(fileName, span[0], span[1])
      } else {
        console.log('invalid parameter')
      }
    } catch (error) {
      console.log(error)
    }
  }

  _addEntireDocument (fileName) {
    try {
      var src = fs.readFileSync(fileName)
      var ext = new pdf.ExternalDocument(src)
      this.doc.setTemplate(ext)
      this.doc.addPagesOf(ext)
    } catch (error) {
      console.log(error)
    }
  }

  _addFromToPage (fileName, from, to) {
    try {
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

  _addGivenPages (fileName, pages) {
    try {
      if (pages.length > 0) {
        for (var page in pages) {
          var src = fs.readFileSync(fileName)
          var ext = new pdf.ExternalDocument(src)
          this.doc.setTemplate(ext)
          this.doc.addPageOf(pages[page], ext)
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

  _checkFileExist (fileName) {
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

module.exports = PDFMerger
