/**
 * @jest-environment jsdom
 */

const path = require('path')
const fs = require('fs-extra')
const pdfDiff = require('pdf-diff')
/*
  add a global `windows.fetch` to mock fetch
*/
global.window.fetch = jest.fn().mockImplementation((requestUrl) => {
  const URL = require('url').URL
  try {
    const url = new URL(requestUrl)
    if (!['http:', 'https:', 'data-url:', 'blob:'].includes(url.protocol)) {
      throw TypeError
    }
  } catch {
    throw new TypeError('Failed to Fetch')
  }
  if (requestUrl === 'https://google.com') {
    throw new TypeError('Failed to Fetch')
  }
  return Promise.resolve({ arrayBuffer: async () => fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf')) })
})

const PDFMerger = require('../browser')

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(100000)

let fileA
let fileB

// Note: The browser tests differ from standard as all files are expected
// to be generated or fetched before being passed into the merger.
// For testing, they are retrieved with fs.ReadFile() and then passed in.
describe('PDFMerger', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
    fileA = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    fileB = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
  })

  describe('test successful merges', () => {
    test('merge two simple files', async () => {
      const merger = new PDFMerger()

      await merger.add(fileA)
      await merger.add(fileB)

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, 'Testfile_AB.pdf'), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (array)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo1.pdf'

      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_AB.pdf')),
        [1]
      )
      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'UDHR.pdf')),
        [1, 2, 3]
      )

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, tmpFile), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start-end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'

      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_AB.pdf')),
        [1]
      )
      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'UDHR.pdf')),
        '1-3'
      )

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, tmpFile), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start - end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'

      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_AB.pdf')),
        [1]
      )
      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'UDHR.pdf')),
        '1 - 3'
      )

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, tmpFile), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start to end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'

      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_AB.pdf')),
        [1]
      )
      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'UDHR.pdf')),
        '1 to 3'
      )

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, tmpFile), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('merge pdfs from urls', async () => {
      const merger = new PDFMerger()

      await merger.add(
        'https://github.com/nbesli/pdf-merger-js/raw/master/test/fixtures/Testfile_A.pdf'
      )
      await merger.add(
        await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
      )

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, 'Testfile_AB.pdf'), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )

      expect(diff).toBeFalsy()
    })
  })

  describe('test valid inputs', () => {
    test('ensure Buffer can be imported', async () => {
      expect(fileA).toBeInstanceOf(Buffer)
      expect(fileB).toBeInstanceOf(Buffer)

      const merger = new PDFMerger()
      await merger.add(fileA)
      await merger.add(fileB)

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, 'Testfile_AB.pdf'), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )

      expect(diff).toBeFalsy()
    })

    test('ensure ArrayBuffer can be imported', async () => {
      function toArrayBuffer (buff) {
        const arrayBuffer = new ArrayBuffer(buff.length)
        const typedArray = new Uint8Array(arrayBuffer)
        for (let i = 0; i < buff.length; ++i) {
          typedArray[i] = buff[i]
        }
        return arrayBuffer
      }

      const arrayBufferA = toArrayBuffer(fileA)
      const arrayBufferB = toArrayBuffer(fileB)

      expect(arrayBufferA).toBeInstanceOf(ArrayBuffer)
      expect(arrayBufferB).toBeInstanceOf(ArrayBuffer)

      const merger = new PDFMerger()
      await merger.add(arrayBufferA)
      await merger.add(arrayBufferB)

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, 'Testfile_AB.pdf'), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )

      expect(diff).toBeFalsy()
    })

    test('ensure Blob can be imported', async () => {
      class MockBlob extends global.Blob {
        constructor (props) {
          super(props)

          this.arrayBuffer = async () => {
            return fileA
          }
        }
      }

      const blobA = new MockBlob([new Uint8Array(fileA, fileA.byteOffset, fileA.length)], { type: 'application/pdf' })

      expect(blobA).toBeInstanceOf(global.Blob)

      const merger = new PDFMerger()
      await merger.add(blobA)
      await merger.add(fileB)

      const buffer = await merger.saveAsBuffer()
      // Write the buffer as a file for pdfDiff
      await fs.writeFile(path.join(TMP_DIR, 'Testfile_AB.pdf'), buffer)

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )

      expect(diff).toBeFalsy()
    })
  })

  describe('test invalid inputs', () => {
    test('ensure improper urls cannot be imported', async () => {
      const merger = new PDFMerger()

      await expect(merger.add('h://google.com')).rejects.toThrow(TypeError)
      await expect(merger.add('https://google.com')).rejects.toThrow(TypeError)
    })
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
    // await new Promise(resolve => setTimeout(resolve, 10000))
  })
})
