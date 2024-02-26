/**
 * Takes a string like "1,2,3" or "1-3" and returns an Array of numbers.
 *
 * @param {string} pages
 * @param {string} lastPagePlaceholder
 *
 * @example ```js
 * parsePagesString('2') // [2]
 * parsePagesString('1,2,3') // [1,2,3]
 * parsePagesString('1-3') // [1,2,3]
 * parsePagesString('2-') // [2, -1]
 * parsePagesString('-3') // [-1, 3]
 * parsePagesString('1to3') // [1,2,3]
 * parsePagesString('1 to 3') // [1,2,3]
 * parsePagesString('10,1-3') // [10,1,2,3]
 * parsePagesString('9,1-3,5-7') // [9,1,2,3,5,6,7]
 * ```
 */
export function parsePagesString (pages, lastPagePlaceholder = '$') {
  const throwError = () => {
    throw new Error([
      'Invalid parameter "pages".',
      'Must be a string like "1,2,3" or "1-3" or "1-" or "-3" or "1to3"',
      `Was "${pages}" instead.`
    ].join(' '))
  }

  const isRangeString = (rangeString) => {
    return rangeString.includes('-') || rangeString.toLowerCase().includes('to')
  }

  const parseRange = (rangeString) => {
    const [start, end] = rangeString.split(/-|to/).map(s => {
      if (typeof s !== 'string') {
        return s
      }

      const trimmed = s.trim()
      return trimmed ? (trimmed === lastPagePlaceholder ? -1 : parseInt(trimmed)) : s
    })
    const hasStart = typeof start === 'number'
    const hasEnd = typeof end === 'number'
    return (hasStart && hasEnd)
      ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
      : hasStart ? [start, -1] : [-1, end]
  }

  if (typeof pages !== 'string') {
    throwError()
  }

  const trimmed = pages.trim()
  if (!trimmed.replace(/ /g, '').match(/^(\$|\d+|\d+-\d+|\d+-|-\d+|\d+to\d+)(,(\d+|\d+-\d+|\d+to\d+))*$/)) {
    // string does not fit the expected pattern
    throwError()
  } else if (trimmed.match(/^(\$|\d+)$/)) {
    // string consists of a single page-number
    return [trimmed === lastPagePlaceholder ? -1 : parseInt(trimmed)]
  } else if (trimmed.includes(',')) {
    // string consists od a list of page-numbers and/or ranges
    return pages.split(',').flatMap(s => isRangeString(s) ? parseRange(s) : parseInt(s === lastPagePlaceholder ? -1 : parseInt(s)))
  } else if (isRangeString(pages)) {
    // string consists of a single range
    return parseRange(pages)
  }

  throwError()
}
