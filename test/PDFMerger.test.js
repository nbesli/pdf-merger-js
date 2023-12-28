import path from 'path'

import fs from 'fs-extra'
import pdfDiff from 'pdf-diff'
import { PDFDocument } from 'pdf-lib'
import { jest } from '@jest/globals'

import PDFMerger from '../index'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(10000)

describe('PDFMerger', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
  })

  test('merge two simple files', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))

    const diff = await pdfDiff(
      path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
      path.join(TMP_DIR, 'Testfile_AB.pdf')
    )

    expect(diff).toBeFalsy()
  })

  test('reset the internal document', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'MergeDemo.pdf'))
    merger.reset()
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))

    const diff = await pdfDiff(
      path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
      path.join(TMP_DIR, 'Testfile_AB.pdf')
    )

    expect(diff).toBeFalsy()
  })

  test('set title and check if title is set properly', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))

    const testTitle = 'Test Title'

    await merger.setMetadata({
      title: testTitle
    })

    await merger.save(path.join(TMP_DIR, 'TestfileAMetadata.pdf'))
    const pdfData = fs.readFileSync(path.join(TMP_DIR, 'TestfileAMetadata.pdf'))

    const outputDocument = await PDFDocument.load(pdfData, { ignoreEncryption: true })
    const outputTitle = outputDocument.getTitle()

    expect(testTitle).toBe(outputTitle)
  })

  describe('test valid inputs', () => {
    test('provide input as Uint8Array', async () => {
      const merger = new PDFMerger()
      const TestfileAUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
      expect(TestfileAUint8Array).toBeInstanceOf(Uint8Array)
      await merger.add(TestfileAUint8Array)
      const TestfileBUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
      expect(TestfileBUint8Array).toBeInstanceOf(Uint8Array)
      await merger.add(TestfileBUint8Array)
      await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))
      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )
      expect(diff).toBeFalsy()
    })

    test('provide input as ArrayBuffer', async () => {
      const merger = new PDFMerger()
      const TestfileAUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf'), null)
      const TestfileABuffer = TestfileAUint8Array.buffer
      expect(TestfileABuffer).toBeInstanceOf(ArrayBuffer)
      const TestfileBUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_B.pdf'), null)
      const TestfileBBuffer = TestfileBUint8Array.buffer
      expect(TestfileBBuffer).toBeInstanceOf(ArrayBuffer)
      await merger.add(TestfileABuffer)
      await merger.add(TestfileBBuffer)
      await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))
      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )
      expect(diff).toBeFalsy()
    })

    const testIfBlob = typeof Blob !== 'undefined' ? test : test.skip
    testIfBlob('provide input as Blob', async () => {
      const merger = new PDFMerger()
      const TestfileAUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
      const TestfileABlob = new Blob([TestfileAUint8Array])
      expect(TestfileABlob).toBeInstanceOf(Blob)
      await merger.add(TestfileABlob)
      const TestfileBUint8Array = await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
      const TestfileBBlob = new Blob([TestfileBUint8Array])
      expect(TestfileBBlob).toBeInstanceOf(Blob)
      await merger.add(TestfileBBlob)
      await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))
      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )
      expect(diff).toBeFalsy()
    })

    const testIfFetch = typeof fetch !== 'undefined' ? test : test.skip
    testIfFetch('provide input as URL', async () => {
      const merger = new PDFMerger()
      const TestfileAURL = new URL('https://github.com/nbesli/pdf-merger-js/raw/master/test/fixtures/Testfile_A.pdf')
      expect(TestfileAURL).toBeInstanceOf(URL)
      await merger.add(TestfileAURL)
      const TestfileBURL = new URL('https://github.com/nbesli/pdf-merger-js/raw/master/test/fixtures/Testfile_B.pdf')
      expect(TestfileBURL).toBeInstanceOf(URL)
      await merger.add(TestfileBURL)
      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
        path.join(TMP_DIR, 'Testfile_AB.pdf')
      )
      expect(diff).toBeFalsy()
    })
  })

  describe('test valid output formats', () => {
    test('saveAsBuffer returns a Buffer', async () => {
      const merger = new PDFMerger()
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'))
      const buffer = await merger.saveAsBuffer()
      expect(buffer instanceof Buffer).toEqual(true)
    })
  })

  describe('test valid page definitions', () => {
    test('combine pages from multiple books (array)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo1.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), [1])
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), [1, 2, 3])
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (string - array)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo1.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), '1')
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), [1, 2, 3])
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (plain number - array)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo1.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), 1)
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), [1, 2, 3])
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start - end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), [1])
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), '1 - 3')
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start to end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), [1])
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), '1 to 3')
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })

    test('combine pages from multiple books (start-end)', async () => {
      const merger = new PDFMerger()
      const tmpFile = 'MergeDemo2.pdf'
      await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'), [1])
      await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), '1-3')
      await merger.save(path.join(TMP_DIR, tmpFile))

      const diff = await pdfDiff(
        path.join(FIXTURES_DIR, 'MergeDemo.pdf'),
        path.join(TMP_DIR, tmpFile)
      )

      expect(diff).toBeFalsy()
    })
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
