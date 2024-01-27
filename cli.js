#!/usr/bin/env node

import fs from 'fs'
import { program } from 'commander'

import PDFMerger from './index.js'
import { parsePagesString } from './parsePagesString.js'

function main (packageJson) {
  program
    .version(packageJson.version)
    .description(packageJson.description)
    .option('-o, --output <outputFile>', 'Merged PDF output file path')
    .option('-v, --verbose', 'Print verbose output')
    .option('-s, --silent', 'do not print any output to stdout. Overwrites --verbose')
    .arguments('<inputFiles...>')
    .action(async (inputFiles, cmd) => {
      const outputFile = cmd.output
      const verbose = cmd.verbose && !cmd.silent
      const silent = cmd.silent

      if (!outputFile) {
        console.error('Please provide an output file using the --output flag')
        return
      }

      if (!inputFiles || !inputFiles.length) {
        console.error('Please provide at least one input file')
        return
      }

      try {
        const merger = new PDFMerger()

        for (const inputFile of inputFiles) {
          const [filePath, pagesString] = inputFile.split('#')
          const pages = pagesString ? parsePagesString(pagesString) : null
          if (verbose) {
            if (pages && pages.length) {
              console.log(`adding page${pages.length > 1 ? 's' : ''} ${pages.join(',')} from ${filePath} to output...`)
            } else {
              console.log(`adding all pages from ${filePath} to output...`)
            }
          }
          await merger.add(filePath, pages)
        }

        if (verbose) {
          console.log(`Saving merged output to ${outputFile}...`)
        }

        await merger.save(outputFile)

        if (!silent) {
          console.log(`Merged pages successfully into ${outputFile}`)
        }
      } catch (error) {
        console.error('An error occurred while merging the PDFs:', error)
      }
    })

  program.parse(process.argv)
}

(() => {
  const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
  main(packageJson)
})()
