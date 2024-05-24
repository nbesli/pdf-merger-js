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
  const throwError = (extraInfo) => {
    throw new Error([
      'Invalid parameter "pages".',
      'Must be a string like "1,2,3" or "1-3" or "1-" or "-3" or "1to3"',
      `Was "${pages}" instead.`,
      ...(Array.isArray(extraInfo) ? extraInfo : [extraInfo])
    ].join(' '))
  }

  const parseRange = (rangeString) => {
    const [start, end] = rangeString.split(/-|to/).map(s => {
      if (typeof s !== 'string') {
        return s
      }

      const trimmed = s.trim()
      return trimmed ? (parsePageFromEnd(trimmed, lastPagePlaceholder) ?? parseInt(trimmed)) : s
    })
    const hasStart = typeof start === 'number'
    const hasEnd = typeof end === 'number'
    return (hasStart && hasEnd)
      ? (start < 0 || end < 0) ? [start, end] : Array.from({ length: end - start + 1 }, (_, i) => start + i)
      : hasStart ? [start, -1] : [-1, end]
  }

  if (typeof pages !== 'string') {
    throwError('parameter is not a string')
  }

  const trimmed = pages.trim()

  if (!trimmed.replace(/ /g, '').match(/^(\$\d*|\d+|\$?\d+-\$?\d+|\$?\d+-|-\$?\d+|\$?\d+to\$?\d+)(,(\$\d*|\d+|\$?\d+-\$?\d+|\$?\d+to\$?\d+))*$/)) {
    // string does not fit the expected pattern
    throwError('string does not fit the expected pattern')
  } else if (trimmed.match(/^(\$\d*|\d+)$/)) {
    // string consists of a single page-number
    return [parsePageFromEnd(trimmed, lastPagePlaceholder) ?? parseInt(trimmed)]
  } else if (trimmed.includes(',')) {
    // string consists od a list of page-numbers and/or ranges
    return pages.split(',').flatMap(s => isRangeString(s) ? parseRange(s) : (parsePageFromEnd(s, lastPagePlaceholder) ?? parseInt(s)))
  } else if (isRangeString(pages)) {
    // string consists of a single range
    return parseRange(pages)
  }

  throwError('unsupported type')
}

const isRangeString = (rangeString) => {
  return rangeString.includes('-') || rangeString.toLowerCase().includes('to')
}

/**
 * Takes a string like "$" or "$2" and returns the corresponding transformation in reverse notion (from the last page).
 *
 * @param {string} pageStr
 * @param {string} lastPagePlaceholder
 *
 * @example ```js
 * parsePageFromEnd('$') // -1
 * parsePageFromEnd('$2') // -2
 * ```
 */
export function parsePageFromEnd (pageStr, lastPagePlaceholder = '$') {
  if (typeof pageStr !== 'string' || isRangeString(pageStr) || !pageStr.startsWith(lastPagePlaceholder)) {
    return null
  }

  return -1 * (pageStr.length <= 1 ? 1 : parseInt(pageStr.substring(1).trim()))
}
