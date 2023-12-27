import { parsePagesString } from '../parsePagesString'

describe('parsePagesString', () => {
  test('should parse lists', () => {
    expect(parsePagesString('2')).toStrictEqual([2])
    expect(parsePagesString(' 2 ')).toStrictEqual([2])
    expect(parsePagesString('1,2,3')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1,2,3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1, 2, 3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1 , 2 , 3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 2,4,6 ')).toStrictEqual([2, 4, 6])
  })

  test('should parse ranges', () => {
    expect(parsePagesString('1-3')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1-3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1 - 3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString('2-6')).toStrictEqual([2, 3, 4, 5, 6])
  })

  test('should parse range with "to"', () => {
    expect(parsePagesString('1to3')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1to3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString(' 1 to 3 ')).toStrictEqual([1, 2, 3])
    expect(parsePagesString('2 to 6')).toStrictEqual([2, 3, 4, 5, 6])
  })

  test('should parse combined lists and ranges', () => {
    expect(parsePagesString('1-3,4')).toStrictEqual([1, 2, 3, 4])
    expect(parsePagesString(' 1-3 , 4 , 5')).toStrictEqual([1, 2, 3, 4, 5])
    expect(parsePagesString(' 1 - 3, 5-7 ')).toStrictEqual([1, 2, 3, 5, 6, 7])
    expect(parsePagesString(' 9,8,1 - 3, 5-6 ,8,9')).toStrictEqual([9, 8, 1, 2, 3, 5, 6, 8, 9])
    expect(parsePagesString('2-6,8')).toStrictEqual([2, 3, 4, 5, 6, 8])
    expect(parsePagesString('1,3-5,7')).toStrictEqual([1, 3, 4, 5, 7])
    expect(parsePagesString('11-13,5,8,16-18,14')).toStrictEqual([11, 12, 13, 5, 8, 16, 17, 18, 14])
  })

  test('invalid', () => {
    expect(() => parsePagesString()).toThrow()
    expect(() => parsePagesString(null)).toThrow()
    expect(() => parsePagesString({})).toThrow()

    expect(() => parsePagesString('')).toThrow()
    expect(() => parsePagesString('-1to-3')).toThrow()
    expect(() => parsePagesString('1--3')).toThrow()
    expect(() => parsePagesString('1 until 3')).toThrow()
    expect(() => parsePagesString('1-')).toThrow()
    expect(() => parsePagesString('10e3')).toThrow()
  })
})
