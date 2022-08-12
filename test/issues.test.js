const path = require('path')
const fs = require('fs-extra')
const fetch = require('node-fetch')

const PDFMerger = require('../index')

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(30000)

describe('issues', () => {
  beforeAll(async () => {
    await fs.ensureDir(TMP_DIR)
  })

  test('do multiple merges after another (#29)', async () => {
    const merger = new PDFMerger()

    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))

    await merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
    await merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
    await merger.save(path.join(TMP_DIR, 'Testfile_BA.pdf'))
  })

  test('merge a compresses pdf (#42)', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'issue-42.pdf'))
    await merger.save(path.join(TMP_DIR, 'issue-42_merged.pdf'))
  })

  test('check resulting file size (#31)', async () => {
    function getFilenameFromUrl (url) {
      const oUrl = new URL(url)
      const filename = path.basename(oUrl.pathname)
      return filename
    }

    async function downloadFile (url) {
      const targetFile = path.join(FIXTURES_DIR, getFilenameFromUrl(url))
      try {
        await fs.stat(targetFile)
        return true
      } catch {
        console.log('Big files not present. Downloading...')
      }
      const res = await fetch(url)
      const aBuffer = await res.arrayBuffer()
      await fs.writeFile(targetFile, Buffer.from(aBuffer))
    }

    // add some big pdf-files it doesn't realy matter witch ones!
    const bigFiles = [
      'https://www.ipcc.ch/report/ar6/wg3/downloads/report/IPCC_AR6_WGIII_SPM.pdf',
      'https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM_final.pdf',
      'https://www.ipcc.ch/site/assets/uploads/sites/3/2019/12/SROCC_FullReport_FINAL.pdf'
    ]

    // download some big files
    try {
      for (const url of bigFiles) {
        await downloadFile(url)
        await fs.stat(path.join(FIXTURES_DIR, getFilenameFromUrl(url)))
      }
    } catch (e) {
      console.warn(`Could not download some big files to test issue #31. Please ensure the urls are still valid! ${e}`)
    }

    const merger = new PDFMerger()

    for (const url of bigFiles) {
      // add the first page of each pdf to the result
      merger.add(path.join(FIXTURES_DIR, getFilenameFromUrl(url)), [1])
    }

    await merger.save(path.join(TMP_DIR, 'IPCC.pdf'))

    const stats = await fs.stat(path.join(TMP_DIR, 'IPCC.pdf'))
    expect(stats.size).toBeLessThan(2000000) // less than 2MB
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
