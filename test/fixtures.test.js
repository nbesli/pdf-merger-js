const path = require('path')
const fs = require('fs-extra')
const pdfDiff = require('pdf-diff')
const { PDFDocument } = require('pdf-lib')

const PDFMerger = require('../index')

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

  test('combine pages from multipel books (array)', async () => {
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

  test('combine pages from multipel books (string - array)', async () => {
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

  test('combine pages from multipel books (plain number - array)', async () => {
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

  test('combine pages from multipel books (start - end)', async () => {
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

  test('combine pages from multipel books (start to end)', async () => {
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

  test('combine pages from multipel books (start-end)', async () => {
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

  test('saveAsBuffer returns a Buffer', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_AB.pdf'))
    const buffer = await merger.saveAsBuffer()
    expect(buffer instanceof Buffer).toEqual(true)
  })

  test('set title and check if title is set properly', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))

    const testTitle = 'Test Title'

    await merger.setMetadata({
      title: testTitle
    })

    await merger.save(path.join(TMP_DIR, 'Testfile_A_Metadata.pdf'))
    const pdfData = fs.readFileSync(path.join(TMP_DIR, 'Testfile_A_Metadata.pdf'))

    const outputDocument = await PDFDocument.load(pdfData, { ignoreEncryption: true })
    const outputTitle = outputDocument.getTitle()

    expect(testTitle).toBe(outputTitle)
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
