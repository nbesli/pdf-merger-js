const path = require('path')
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

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
