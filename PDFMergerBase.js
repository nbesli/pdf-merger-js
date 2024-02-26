import { PDFDocument } from 'pdf-lib'

import { parsePageFromEnd, parsePagesString } from './parsePagesString.js'

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

export default class PDFMergerBase {
  /**
   * The internal pdf-lib document.
   *
   * @protected
   * @type {PDFDocument | undefined}
   */
  _doc = undefined

  _lastPagePlaceholder = '$'

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
   * @param {PdfInput} input - a pdf source
   * @param {string | string[] | number | number[] | undefined | null} [pages]
   * @returns {Promise<void>}
   */
  async add (input, pages) {
    await this._ensureDoc()

    if (typeof pages === 'undefined' || pages === null || pages === 'all') {
      // of no pages are given, add the entire document

      await this._addPagesFromDocument(input)
    } else if (Array.isArray(pages)) {
      // e.g. [2,3,6] or ["2","3","6"]
      const pagesAsNumbers = pages.map(p => typeof p === 'string' ? (parsePageFromEnd(p) ?? parseInt(p.trim())) : p)
      await this._addPagesFromDocument(input, pagesAsNumbers)
    } else if (typeof pages === 'number' || (typeof pages === 'string' && new RegExp(`^\\${this._lastPagePlaceholder}\\d*$`).test(pages))) {
      // e.g. 2
      await this._addPagesFromDocument(input, [parsePageFromEnd(pages) ?? pages])
    } else if (typeof pages === 'string' || pages instanceof String) {
      // e.g. "2,3,6" or "2-6" or "2to6,8,10-12"
      const pagesArray = parsePagesString(pages, this._lastPagePlaceholder)
      await this._addPagesFromDocument(input, pagesArray)
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
    if (typeof Blob !== 'undefined' && input instanceof Blob) {
      const aBuffer = await input.arrayBuffer()
      return new Uint8Array(aBuffer)
    }

    // see https://developer.mozilla.org/en-US/docs/Web/API/URL
    if (input instanceof URL) {
      if (typeof fetch === 'undefined') {
        throw new Error('fetch is not defined. You need to use a polyfill for this to work.')
      }
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
   * @async
   * @protected
   * @param {PdfInput} input
   * @param {(number | string)[] | undefined} pages - array of page numbers, or start/end index to add (starts at 1)
   * @returns {Promise<void>}
   */
  async _addPagesFromDocument (input, pages = undefined) {
    const src = await this._getInputAsUint8Array(input)
    const srcDoc = await PDFDocument.load(src, this._loadOptions)

    let indices = []

    if (pages === undefined) {
      // add the whole document
      indices = srcDoc.getPageIndices()
    } else if (pages.length === 1 && pages[0] < 0) {
      // Last page onwards
      const total = srcDoc.getPageCount()
      indices = (total >= Math.abs(pages[0])) ? [total - Math.abs(pages[0])] : srcDoc.getPageIndices()
    } else {
      const rangeStart = pages[0]
      const rangeEnd = pages[pages.length - 1]

      const lastPageOnly = pages.length === 1 && rangeStart === -1
      const indeterminateStart = pages.length > 1 && rangeStart < 0
      const indeterminateEnd = (pages.length > 1 && rangeEnd < 0)

      const total = srcDoc.getPageCount()

      // add selected pages switching to a 0-based index
      if (indeterminateStart || indeterminateEnd) {
        // add selected pages switching to a 0-based index

        let start = indeterminateStart ? rangeStart === -1 ? 1 : (total - Math.abs(rangeStart) + 1) : rangeStart
        let end = indeterminateEnd ? total - Math.abs(rangeEnd) + 1 : rangeEnd

        start = start - 1
        end = end - 1

        indices = lastPageOnly
          ? [total - 1]
          : indeterminateEnd
            ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
            : Array.from({ length: end - start + 1 }, (_, i) => i)
      } else {
        indices = pages.map(p => (p < 0 ? (total - Math.abs(p) + 1) : p) - 1)
      }
    }

    const copiedPages = await this._doc.copyPages(srcDoc, indices).catch(err => {
      console.error(`Error copying pages: ${err}`)
      return []
    })
    copiedPages.forEach((page) => {
      if (page) { this._doc.addPage(page) }
    })
  }
}
