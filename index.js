import fs from 'fs/promises'

import PDFMergerBase from './PDFMergerBase.js'

/**
 * @typedef {import('fs/promises').PathLike} PathLike
 */
/**
 * @typedef {import(./PDFMergerBase).PdfInput | Buffer | String | PathLike | string} PdfInput
 */

export default class PDFMerger extends PDFMergerBase {
  /**
   * Returns a Uint8Array of the input.
   *
   * If input is a string, it is treated as an Filepath
   * If the file does not exist, it is treated as an URL.
   *
   * @async
   * @protected
   * @override
   * @param {PdfInput} input
   * @returns {Uint8Array}
   */
  async _getInputAsUint8Array (input) {
    if (input instanceof Buffer) {
      return input
    }

    // strings can be a path to a (local) files or a external URL
    if (typeof input === 'string' || input instanceof String) {
      try {
        await fs.access(input)
        return await fs.readFile(input)
      } catch (e) {
        try {
          Boolean(new URL(input))
          input = new URL(input)
        } catch (e) {
          throw new Error(`The provided string "${input}" is neither a valid file-path nor a valid URL!`)
        }
      }
    }

    return await super._getInputAsUint8Array(input)
  }

  /**
   * Return the merged PDF as a Buffer.
   *
   * @async
   * @returns {Promise<Buffer>}
   */
  async saveAsBuffer () {
    const uInt8Array = await this._saveAsUint8Array()
    return Buffer.from(uInt8Array)
  }

  /**
   * Save the merged PDF to the given path.
   *
   * @async
   * @param {string | PathLike} fileName
   * @returns {Promise<void>}
   */
  async save (fileName) {
    const pdfBytes = await this._saveAsUint8Array()
    await fs.writeFile(fileName, pdfBytes)
  }
}
