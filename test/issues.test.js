import path from 'path'

import fs from 'fs-extra'
import { jest } from '@jest/globals'

import PDFMerger from '../index'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(10000)

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

  test('merge a encrypted pdf (#88)', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'issue-88.pdf'))
    await merger.save(path.join(TMP_DIR, 'issue-88_merged.pdf'))
  })

  test('merge the last pages of a pdf (#101)', async () => {
    const merger = new PDFMerger()
    await merger.add(path.join(FIXTURES_DIR, 'UDHR.pdf'), '7 to 8')
    await merger.save(path.join(TMP_DIR, 'issue-101_me.pdf'))
  })

  afterAll(async () => {
    await fs.remove(TMP_DIR)
  })
})
