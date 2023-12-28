/**
 * @jest-environment jsdom
 */

import path from 'path'
import fs from 'fs-extra'
import pdfDiff from 'pdf-diff'
import { jest } from '@jest/globals'

import PDFMerger from '../browser'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(100000)

let fileA
let fileB

async function readFixtureAsUint8Array (file) {
  const buffer = await fs.readFile(path.join(FIXTURES_DIR, file))
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length)
}

// Note: The browser tests differ from standard as all files are expected
// to be generated or fetched before being passed into the merger.
// For testing, they are retrieved with fs.ReadFile() and then passed in.
describe('PDFMerger for browser', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
    fileA = await readFixtureAsUint8Array('Testfile_A.pdf')
    fileB = await readFixtureAsUint8Array('Testfile_B.pdf')
  })

  describe('test return values', () => {
    test('saveAsBuffer returns a Uint8Array', async () => {
      const merger = new PDFMerger()
      await merger.add(fileA)
      const buffer = await merger.saveAsBuffer()
      expect(buffer).toBeInstanceOf(Uint8Array)
    })

    test('saveAsBlob returns a Blob', async () => {
      const merger = new PDFMerger()
      await merger.add(fileA)
      const blob = await merger.saveAsBlob()
      expect(blob).toBeInstanceOf(Blob)
    })
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
        await readFixtureAsUint8Array('Testfile_AB.pdf'),
        [1]
      )
      await merger.add(
        await readFixtureAsUint8Array('UDHR.pdf'),
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
        await readFixtureAsUint8Array('Testfile_AB.pdf'),
        [1]
      )
      await merger.add(
        await readFixtureAsUint8Array('UDHR.pdf'),
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
        await readFixtureAsUint8Array('Testfile_AB.pdf'),
        [1]
      )
      await merger.add(
        await readFixtureAsUint8Array('UDHR.pdf'),
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
        await readFixtureAsUint8Array('Testfile_AB.pdf'),
        [1]
      )
      await merger.add(
        await readFixtureAsUint8Array('UDHR.pdf'),
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

    const testIfFetch = typeof fetch !== 'undefined' ? test : test.skip
    testIfFetch('merge pdfs from urls', async () => {
      const merger = new PDFMerger()

      await merger.add(
        'https://github.com/nbesli/pdf-merger-js/raw/master/test/fixtures/Testfile_A.pdf'
      )
      await merger.add(
        await readFixtureAsUint8Array('Testfile_B.pdf')
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

    test('merge two simple files', async () => {
      const merger = new PDFMerger()

      await merger.add(fileB)
      merger.reset()

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
  })

  describe('test valid inputs', () => {
    test('ensure Uint8Array can be imported', async () => {
      expect(fileA).toBeInstanceOf(Uint8Array)
      expect(fileB).toBeInstanceOf(Uint8Array)

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
      const arrayBufferA = fileA.buffer
      const arrayBufferB = fileB.buffer

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

      const blobA = new MockBlob([fileA], { type: 'application/pdf' })

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

      await expect(merger.add('h://google.com')).rejects.toThrow(Error)
      await expect(merger.add('https://google.com')).rejects.toThrow(Error)
    })
  })

  describe('test for specific issues', () => {
    test('merge a encrypted pdf (#88)', async () => {
      const merger = new PDFMerger()

      const fileIssue88 = await readFixtureAsUint8Array('issue-88.pdf')
      await merger.add(fileIssue88)

      await merger.saveAsBuffer()
    })
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
