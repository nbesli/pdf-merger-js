const { PDFDocument } = require('pdf-lib')
const fs = require('fs').promises

class PDFMerger {
  constructor () {
    this.doc = undefined

    this.loadOptions = {
      // allow merging of encrypted pdfs (issue #88)
      ignoreEncryption: true
    }
  }

  async add (inputFile, pages) {
    await this._ensureDoc()
    if (typeof pages === 'undefined' || pages === null) {
      await this._addEntireDocument(inputFile)
    } else if (Array.isArray(pages)) {
      await this._addGivenPages(inputFile, pages)
    } else if (typeof pages === 'number') {
      await this._addGivenPages(inputFile, new Array(pages.toString()))
    } else if (pages.indexOf(',') > 0) {
      await this._addGivenPages(inputFile, pages.replace(/ /g, '').split(','))
    } else if (pages.toLowerCase().indexOf('to') >= 0) {
      const span = pages.replace(/ /g, '').split('to')
      await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
    } else if (pages.indexOf('-') >= 0) {
      const span = pages.replace(/ /g, '').split('-')
      await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
    } else if (pages.toString().trim().match(/^[0-9]+$/)) {
      await this._addGivenPages(inputFile, new Array(pages))
    } else {
      throw new Error('invalid parameter "pages"')
    }
  }

  async _ensureDoc () {
    if (!this.doc) {
      this.doc = await PDFDocument.create()
      this.doc.setProducer('pdf-merger-js')
      this.doc.setCreationDate(new Date())
    }
  }

  async _getInputAsBuffer (input) {
    if (input instanceof Buffer || input instanceof ArrayBuffer) {
      return input
    }
    return await fs.readFile(input)
  }

  async _addEntireDocument (input) {
    const src = await this._getInputAsBuffer(input)
    const srcDoc = await PDFDocument.load(src, this.loadOptions)

    const copiedPages = await this.doc.copyPages(srcDoc, srcDoc.getPageIndices())
    copiedPages.forEach((page) => {
      this.doc.addPage(page)
    })
  }

  async _addFromToPage (input, from, to) {
    if (typeof from !== 'number' || typeof to !== 'number' || from < 1 || from < 1) {
      throw new Error('Invalid function parameter. \'from\' and \'to\' must be positive \'numbers\'.')
    }
    if (to < from) {
      throw new Error('Invalid function parameter. \'to\' must be greater or equal to \'from\'.')
    }

    const src = await this._getInputAsBuffer(input)
    const srcDoc = await PDFDocument.load(src, this.loadOptions)
    const pageCount = srcDoc.getPageCount()

    if (from > pageCount || to > pageCount) {
      throw new Error(`Invalid function parameter. The document has not enough pages. (from:${from}, to:${to}, pages:${pageCount})`)
    }

    const pages = Array.from({ length: (to - from) + 1 }, (_, i) => i + from - 1)
    const copiedPages = await this.doc.copyPages(srcDoc, pages)
    copiedPages.forEach((page) => {
      this.doc.addPage(page)
    })
  }

  async _addGivenPages (input, pages) {
    if (pages.length <= 0) {
      return
    }

    const src = await this._getInputAsBuffer(input)
    const srcDoc = await PDFDocument.load(src, this.loadOptions)

    // switch from indexed 1 to indexed 0
    const pagesIndexed1 = pages.map(p => p - 1)
    const copiedPages = await this.doc.copyPages(srcDoc, pagesIndexed1)
    copiedPages.forEach((page) => {
      this.doc.addPage(page)
    })
  }

  async setMetadata (metadata) {
    await this._ensureDoc()
    if (metadata.producer) this.doc.setProducer(metadata.producer)
    if (metadata.author) this.doc.setAuthor(metadata.author)
    if (metadata.title) this.doc.setTitle(metadata.title)
    if (metadata.creator) this.doc.setCreator(metadata.creator)
  }

  async save (fileName) {
    await this._ensureDoc()
    const pdfBytes = await this.doc.save()
    await fs.writeFile(fileName, pdfBytes)
  }

  async saveAsBuffer () {
    await this._ensureDoc()
    const uInt8Array = await this.doc.save()
    return Buffer.from(uInt8Array)
  }
}

module.exports = PDFMerger
