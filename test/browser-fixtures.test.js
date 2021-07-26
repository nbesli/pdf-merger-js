const path = require('path')
const fs = require('fs-extra')
const pdfDiff = require('pdf-diff')

const PDFMerger = require('../browser')

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(10000)

// Note: The browser tests differ from standard as all files are expected
// to be generated or fetched before being passed into the merger.
// For testing, they are retrieved with fs.ReadFile() and then passed in.
describe('PDFMerger', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
  })

  test('merge two simple files', async () => {
    const merger = new PDFMerger()

    await merger.add(
      await fs.readFile(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
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

  test('combine pages from multiplee books (start to end)', async () => {
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

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
