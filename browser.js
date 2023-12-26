import PDFMergerBase from './PDFMergerBase.js'

const globalObject =
  typeof globalThis === 'object'
    ? globalThis
    : typeof window === 'object'
      ? window // Browser
      : typeof self === 'object'
        ? self // Worker
        : this

/**
 * @typedef {import(./PDFMergerBase).PdfInput | File | String | string} PdfInput
 */

export default class PDFMerger extends PDFMergerBase {
  /**
   * Returns a Uint8Array of the input.
   *
   * If input is a string, it is treated as an URL.
   *
   * @async
   * @protected
   * @overwrite
   * @param {PdfInput} input
   * @returns {Uint8Array}
   */
  async _getInputAsUint8Array (input) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/File
    if (input instanceof globalObject.File) {
      return new Promise((resolve, reject) => {
        const fileReader = new globalObject.FileReader()
        fileReader.onload = function (evt) {
          const result = fileReader.result
          const arrayBuffer = new Uint8Array(result)
          return resolve(arrayBuffer)
        }
        fileReader.readAsArrayBuffer(input)
      })
    }

    // strings are treated as URLs int the browser context
    if (typeof input === 'string' || input instanceof String) {
      try {
        Boolean(new URL(input))
      } catch (e) {
        throw new Error(`This is not a valid url: ${input}`)
      }
      input = new URL(input)
    }

    return await super._getInputAsUint8Array(input)
  }

  /**
   * Return the merged PDF as a Uint8Array.
   *
   * @async
   * @returns {Promise<Uint8Array>}
   */
  async saveAsBuffer () {
    return await this._saveAsUint8Array()
  }

  /**
   * Return the merged PDF as a Blob.
   *
   * @async
   * @returns {Promise<Blob>}
   */
  async saveAsBlob () {
    const buffer = await this._saveAsUint8Array()

    return new globalObject.Blob([buffer], {
      type: 'application/pdf'
    })
  }

  /**
   * Download the PDF as a file with the given name.
   * The extension ".pdf" is appended automatically.
   *
   * @async
   * @param {string} fileName
   * @returns {Promise<void>}
   */
  async save (fileName) {
    const dataUri = await this._saveAsBase64()

    const link = document.createElement('a')
    link.href = dataUri
    link.download = `${fileName}.pdf`
    link.click()
  }
}
