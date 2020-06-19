const path = require('path')
const fs = require('fs-extra')
const pdfDiff = require('pdf-diff')

const PDFMerger = require('../index')

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TMP_DIR = path.join(__dirname, 'tmp')

jest.setTimeout(10000)

describe('PDFMerger', () => {
	beforeAll(async () => {
		await fs.ensureDir(TMP_DIR)
	})

	test('merge two simple files', async () => {
		var merger = new PDFMerger()
		merger.add(path.join(FIXTURES_DIR, 'Testfile_A.pdf'))
		merger.add(path.join(FIXTURES_DIR, 'Testfile_B.pdf'))
		await merger.save(path.join(TMP_DIR, 'Testfile_AB.pdf'))

		diff = await pdfDiff(
			path.join(FIXTURES_DIR, 'Testfile_AB.pdf'),
			path.join(TMP_DIR, 'Testfile_AB.pdf')
		)

		expect(diff).toBeFalsy()
	})

	test('combine images from multibe books (array)', async () => {
		const imagesCinderella = [2, 4, 6, 7, 9, 11]
		const imagesGoodyTwoShoes = [4, 5, 8, 9, 12, 13, 16]

		var merger = new PDFMerger()
		merger.add(path.join(FIXTURES_DIR, 'Cinderella.pdf'), imagesCinderella)
		merger.add(path.join(FIXTURES_DIR, 'GoodyTwoShoes.pdf'), imagesGoodyTwoShoes)
		await merger.save(path.join(TMP_DIR, 'BookImages.pdf'))

		diff = await pdfDiff(
			path.join(FIXTURES_DIR, 'BookImages.pdf'),
			path.join(TMP_DIR, 'BookImages.pdf')
		)

		expect(diff).toBeFalsy()
	})

	afterAll(async () => {
		await fs.remove(TMP_DIR)
	})
})