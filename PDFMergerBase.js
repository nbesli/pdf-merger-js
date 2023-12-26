import { PDFDocument } from 'pdf-lib'

/**
 * @typedef {Object} Metadata
 * @property {string} [producer]
 * @property {string} [author]
 * @property {string} [title]
 * @property {string} [creator]
 */

/**
 * @typedef {Uint8Array | ArrayBuffer | Blob | URL} PdfInput
 */

/**
 * @class PDFMergerBase
 * @classdesc Base class for PDFMerger
 */
export default class PDFMergerBase {
  /**
   * The internal pdf-lib document.
   *
   * @protected
   * @type {PDFDocument | undefined}
   */
  _doc = undefined

  /**
   * The load options for pdf-lib.
   *
   * @type { import('pdf-lib').LoadOptions }
   * @protected
   */
  _loadOptions = {
    // allow merging of encrypted pdfs (issue #88)
    ignoreEncryption: true
  }

  constructor () {
    this.reset()
  }

  /**
   * Resets the internal state of the document, to start again.
   *
   * @returns {void}
   */
  reset () {
    this._doc = undefined
  }

  /**
   * Set the metadata of the merged PDF.
   *
   * @async
   * @param {Metadata} metadata
   * @returns {Promise<void>}
   */
  async setMetadata (metadata) {
    await this._ensureDoc()
    if (metadata.producer) this._doc.setProducer(metadata.producer)
    if (metadata.author) this._doc.setAuthor(metadata.author)
    if (metadata.title) this._doc.setTitle(metadata.title)
    if (metadata.creator) this._doc.setCreator(metadata.creator)
  }

  /**
   * Add pages from a PDF document to the end of the merged document.
   *
   * @async
   * @param {string | Buffer | ArrayBuffer} inputFile a pdf source
   * @param {string | string[] | number | number[] | undefined | null} [pages]
   * @returns {Promise<void>}
   */
  async add (inputFile, pages) {
    await this._ensureDoc()
    if (typeof pages === 'undefined' || pages === null) {
      // of no pages are given, add the entire document
      await this._addEntireDocument(inputFile)
    } else if (typeof pages === 'number') {
      // e.g. 2
      await this._addGivenPages(inputFile, [pages])
    } else if (Array.isArray(pages)) {
      // e.g. [2,3,6] or ["2","3","6"]
      const pagesAsNumbers = pages.map(p => parseInt(p))
      await this._addGivenPages(inputFile, pagesAsNumbers)
    } else if (typeof pages === 'string' || pages instanceof String) {
      if (pages === 'all') {
        // of no pages are given, add the entire document
        await this._addEntireDocument(inputFile)
      } else if (pages.indexOf(',') > 0) {
        // e.g. "2,3,6"
        const list = pages.trim().replace(/ /g, '').split(',')
        await this._addGivenPages(inputFile, list)
      } else if (pages.toLowerCase().indexOf('to') >= 0) {
        // e.g. "2 to 6" or "2to6"
        const span = pages.trim().replace(/ /g, '').split('to')
        await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
      } else if (pages.indexOf('-') >= 0) {
        // e.g. "2 - 6" or "2-6"
        const span = pages.trim().replace(/ /g, '').split('-')
        await this._addFromToPage(inputFile, parseInt(span[0]), parseInt(span[1]))
      } else if (pages.trim().match(/^[0-9]+$/)) {
        // e.g. "2"
        await this._addGivenPages(inputFile, [pages])
      }
    } else {
      throw new Error([
        'Invalid parameter "pages".',
        'Must be a string like "1,2,3" or "1-3" or an Array of numbers.'
      ].join(' '))
    }
  }

  /**
   * Creates a new PDFDocument and sets the metadata
   * if this.#doc does not exist yet
   *
   * @protected
   * @async
   * @returns {Promise<void>}
   */
  async _ensureDoc () {
    if (!this._doc) {
      this._doc = await PDFDocument.create()
      this._doc.setProducer('pdf-merger-js')
      this._doc.setCreationDate(new Date())
    }
  }

  /**
   * Get the merged PDF as a Uint8Array.
   *
   * @async
   * @protected
   * @returns {Promise<Uint8Array>}
   */
  async _saveAsUint8Array () {
    await this._ensureDoc()
    return await this._doc.save()
  }

  /**
   * Get the merged PDF as a Base64 encoded string.
   *
   * @async
   * @protected
   * @returns {Promise<string>}
   */
  async _saveAsBase64 () {
    await this._ensureDoc()
    return await this._doc.saveAsBase64({ dataUri: true })
  }

  /**
   * Converts the input to a Uint8Array.
   * If the input is a string, it is treated as a URL and the document gets fetched.
   *
   * @async
   * @protected
   * @param {PdfInput} input
   * @returns {Uint8Array}
   */
  async _getInputAsUint8Array (input) {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
    if (input instanceof Uint8Array) {
      return input
    }

    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    if (input instanceof ArrayBuffer || Object.prototype.toString.call(input) === '[object ArrayBuffer]') {
      return new Uint8Array(input)
    }

    // see https://developer.mozilla.org/en-US/docs/Web/API/Blob
    if (input instanceof Blob) {
      const aBuffer = await input.arrayBuffer()
      return new Uint8Array(aBuffer)
    }

    // see https://developer.mozilla.org/en-US/docs/Web/API/URL
    if (input instanceof URL) {
      const res = await fetch(input)
      const aBuffer = await res.arrayBuffer()
      return new Uint8Array(aBuffer)
    }

    // throw a meaningful error if input type is unknown or invalid
    const allowedTypes = ['Uint8Array', 'ArrayBuffer', 'File', 'Blob', 'URL']
    let errorMsg = `pdf-input must be of type ${allowedTypes.join(', ')}, a valid filename or url!`
    if (typeof input === 'string' || input instanceof String) {
      errorMsg += ` Input was "${input}" wich is not an existing file, nor a valid URL!`
    } else {
      errorMsg += ` Input was of type "${typeof input}" instead.`
    }
    throw new Error(errorMsg)
  }

  /**
   * Add the entire document to the merged document.
   *
   * @async
   * @protected
   * @param {PdfInput} input
   * @returns {Promise<void>}
   */
  async _addEntireDocument (input) {
    const src = await this._getInputAsUint8Array(input)
    const srcDoc = await PDFDocument.load(src, this._loadOptions)

    const copiedPages = await this._doc.copyPages(srcDoc, srcDoc.getPageIndices())
    copiedPages.forEach((page) => {
      this._doc.addPage(page)
    })
  }

  /**
   * Add a range of pages from the document to the merged document.
   *
   * @async
   * @protected
   * @param {PdfInput} input
   * @param {number} from - first page to add (starts at 1)
   * @param {number} to - last page to add (starts at 1)
   * @returns {Promise<void>}
   */
  async _addFromToPage (input, from, to) {
    if (typeof from !== 'number' || typeof to !== 'number' || from <= 0 || from <= 0) {
      throw new Error('Invalid function parameter. \'from\' and \'to\' must be positive \'numbers\'.')
    }
    if (to < from) {
      throw new Error('Invalid function parameter. \'to\' must be greater or equal to \'from\'.')
    }

    const src = await this._getInputAsUint8Array(input)
    const srcDoc = await PDFDocument.load(src, this._loadOptions)
    const pageCount = srcDoc.getPageCount()

    if (from > pageCount || to > pageCount) {
      throw new Error(`Invalid function parameter. The document has not enough pages. (from:${from}, to:${to}, pages:${pageCount})`)
    }

    // create a array [2,3,4] with from=2 and to=4
    const pages = Array.from({ length: (to - from) + 1 }, (_, i) => i + from - 1)
    const copiedPages = await this._doc.copyPages(srcDoc, pages)
    copiedPages.forEach((page) => {
      this._doc.addPage(page)
    })
  }

  /**
   * @async
   * @protected
   * @param {PdfInput} input
   * @param {number[]} pages - array of page numbers to add (starts at 1)
   * @returns {Promise<void>}
   */
  async _addGivenPages (input, pages) {
    if (pages.length <= 0) {
      return
    }

    const src = await this._getInputAsUint8Array(input)
    const srcDoc = await PDFDocument.load(src, this._loadOptions)

    // switch from indexed 1 to indexed 0
    const pagesIndexed1 = pages.map(p => p - 1)
    const copiedPages = await this._doc.copyPages(srcDoc, pagesIndexed1)
    copiedPages.forEach((page) => {
      this._doc.addPage(page)
    })
  }
}
