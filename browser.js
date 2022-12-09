const { PDFDocument } = require('pdf-lib')

class PDFMerger {
  constructor () {
    this.doc = undefined
  }

  async add (inputFile, pages) {
    await this._ensureDoc()
    if (typeof pages === 'undefined' || pages === null) {
      await this._addEntireDocument(inputFile)
    } else if (Array.isArray(pages)) {
      await this._addGivenPages(inputFile, pages)
    } else if (pages.indexOf(',') > 0) {
      const aPages = pages.replace(/ /g, '').split(',')
      await this._addGivenPages(inputFile, aPages)
    } else if (pages.toLowerCase().indexOf('to') >= 0) {
      const span = pages.replace(/ /g, '').split('to')
      const from = parseInt(span[0])
      const to = parseInt(span[1])
      await this._addFromToPage(inputFile, from, to)
    } else if (pages.indexOf('-') >= 0) {
      const span = pages.replace(/ /g, '').split('-')
      const from = parseInt(span[0])
      const to = parseInt(span[1])
      await this._addFromToPage(inputFile, from, to)
    } else {
      throw new Error('invalid parameter "pages"')
    }
  }

  async _ensureDoc () {
    if (!this.doc) {
      this.doc = await PDFDocument.create()
    }
  }

  async _getInputAsUint8Array (input) {
    if (input instanceof Uint8Array) {
      return input
    }

    if (input instanceof ArrayBuffer || Object.prototype.toString.call(input) === '[object ArrayBuffer]') {
      return new Uint8Array(input)
    }

    if (typeof input === 'string' || input instanceof String) {
      try {
        Boolean(new URL(input))
      } catch (e) {
        throw new Error(`This is not a valid url: ${input}`)
      }
      const res = await window.fetch(input)
      const aBuffer = await res.arrayBuffer()
      return new Uint8Array(aBuffer)
    }

    if (input instanceof window.File) {
      const fileReader = new window.FileReader()
      fileReader.onload = function (evt) {
        return fileReader.result
      }
      fileReader.readAsArrayBuffer(input)
    }

    if (input instanceof window.Blob) {
      const aBuffer = await input.arrayBuffer()
      return new Uint8Array(aBuffer)
    }

    console.log({ input, inputc: Object.prototype.toString.call(input), ArrayBuffer, eq: input.contructor !== ArrayBuffer })
    throw new Error('pdf must be represented as an ArrayBuffer, Blob, File, URL or fetchable string')
  }

  async _addEntireDocument (input) {
    const src = await this._getInputAsUint8Array(input)
    const srcDoc = await PDFDocument.load(src)

    const copiedPages = await this.doc.copyPages(srcDoc, srcDoc.getPageIndices())
    copiedPages.forEach((page) => {
      this.doc.addPage(page)
    })
  }

  async _addFromToPage (inputFile, from, to) {
    if (typeof from !== 'number' || typeof to !== 'number' || from < 0 || from < 0) {
      throw new Error('Invalid function parameter. \'from\' and \'to\' must be positive \'numbers\'.')
    }
    if (to < from) {
      throw new Error('Invalid function parameter. \'to\' must be greater or eaqual to \'from\'.')
    }

    const src = await this._getInputAsUint8Array(inputFile)
    const srcDoc = await PDFDocument.load(src)
    const pageCount = srcDoc.getPageCount()

    if (from >= pageCount || to >= pageCount) {
      throw new Error(`Invalid function parameter. The document has not enough pages. (from:${from}, to:${to}, pages:${pageCount})`)
    }

    // create a array [2,3,4] with from=2 and to=4
    const pages = Array.from({ length: (to - from) + 1 }, (_, i) => i + from - 1)
    const copiedPages = await this.doc.copyPages(srcDoc, pages)
    copiedPages.forEach((page) => {
      this.doc.addPage(page)
    })
  }

  async _addGivenPages (inputFile, pages) {
    if (pages.length <= 0) return

    const src = await this._getInputAsUint8Array(inputFile)
    const srcDoc = await PDFDocument.load(src)

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

  async saveAsBuffer () {
    await this._ensureDoc()
    return await this.doc.save()
  }

  async saveAsBlob () {
    const buffer = await this.saveAsBuffer()

    return new window.Blob([buffer], {
      type: 'application/pdf'
    })
  }

  async save (fileName) {
    const dataUri = await this.doc.saveAsBase64({ dataUri: true })

    const link = document.createElement('a')
    link.href = dataUri
    link.download = `${fileName}.pdf`
    link.click()
  }
}

module.exports = PDFMerger
