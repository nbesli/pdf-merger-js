const path = require('path')
const pdf = require('pdfjs')
const fs = require('fs-extra')

const PDFMerger = require('../index')

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(10000)

describe('issues', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
  })

  test('do multiple merges after another (#29)', async () => {
    const merger = new PDFMerger()

    merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))

    merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_BA.pdf'))
  })

  test.skip('merge compressed pdfs (#42)', async () => {
    // can pdfjs handle this file?
    const doc = new pdf.Document()
    const src = await fs.readFile(path.join(FIXTURES_DIR, 'issue-42.pdf'))
    const ext = new pdf.ExternalDocument(src)
    doc.addPagesOf(ext)
    const fileBuffer = await doc.asBuffer()
    await fs.writeFile(path.join(TMP_DIR, 'Testfile_issue-42_1.pdf'), fileBuffer)

    // ok let's try to use pdf-merger-js
    const merger = new PDFMerger()
    merger.add(path.join(FIXTURES_DIR, 'issue-42.pdf'))

    // first let's make sure we can save the file
    await merger.save(path.join(TMP_DIR, 'Testfile_issue-42_2.pdf'))

    // can we also save the file as a buffer?
    const buffer = await merger.saveAsBuffer()
    await fs.writeFile(path.join(TMP_DIR, 'Testfile_issue-42_3.pdf'), buffer)
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
