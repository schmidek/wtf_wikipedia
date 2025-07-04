import { fromText as parseSentence } from '../04-sentence/index.js'
import cleanup from '../template/parse/toJSON/03-cleanup.js'
import Section from '../02-section/Section.js'
import Paragraph from '../03-paragraph/Paragraph.js'
import preProcess from '../01-document/preProcess/index.js'
import { fromRaw as sentenceFromRaw } from '../04-sentence/index.js'
import Sentence from '../04-sentence/Sentence.js'

const expandVariables = function (s, data) {
  let numBrackets = 0;
  let startIndex = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (startIndex == -1) {
      // Not currently in expansion
      if (c == '{') {
        numBrackets++
        if (numBrackets == 3) {
          startIndex = i + 1
        }
      } else {
        numBrackets = 0
      }
    } else {
      // In expansion
      if (c == '{') {
        numBrackets++
      } else if (c == '}') {
        numBrackets--
        if (numBrackets == 0) {
          // Finished expansion
          const endIndex = i - 2
          const stringToExpand = s.substring(startIndex, endIndex)
          const separatorIndex = stringToExpand.indexOf("|")
          let variable = separatorIndex == -1 ? stringToExpand : stringToExpand.substring(0, separatorIndex)
          variable = variable.toLowerCase()
          let expanded = ""
          if (data[variable] && data[variable] instanceof Sentence) {
            expanded = data[variable].text()
          } else if (separatorIndex != -1 && stringToExpand.length > (separatorIndex+1)) {
            expanded = expandVariables(stringToExpand.substring(separatorIndex+1), data)
          }
          s = s.substring(0, startIndex-3) + expanded + expandVariables(s.substring(endIndex+3), data)
          startIndex = -1
        }
      }
    }
  }
  return s
}

const toMarkdown = function (tmpl, data, doc) {
  let wiki = tmpl.wiki

  // Find the first {{infobox }} or {{#invoke:Infobox|infoboxTemplate
  let openingIndex = wiki.indexOf('{{infobox')
  let openingIndexAlt1 = wiki.indexOf('{{Infobox')
  if (openingIndex == -1 || (openingIndexAlt1 != -1 && openingIndexAlt1 < openingIndex)) {
    openingIndex = openingIndexAlt1
  }
  let openingIndexAlt2 = wiki.indexOf('{{#invoke:Infobox')
  if (openingIndex == -1 || (openingIndexAlt2 != -1 && openingIndexAlt2 < openingIndex)) {
    openingIndex = openingIndexAlt2
  }
  let openingIndexAlt3 = wiki.indexOf('{{#invoke:infobox')
  if (openingIndex == -1 || (openingIndexAlt3 != -1 && openingIndexAlt3 < openingIndex)) {
    openingIndex = openingIndexAlt3
  }
  if (openingIndex == -1) {
    return null
  }
  openingIndex += 2
  let brackets = 2;
  let closingIndex = -1
  for (let i = openingIndex; i < wiki.length; i++) {
    let char = wiki.charAt(i)
    if (char == '}') {
      brackets--
    }
    if (char == '{') {
      brackets++
    }
    if (brackets === 0) {
      closingIndex = i - 1
      break
    }
  }

  if (closingIndex == -1) {
    return null
  }
  wiki = wiki.substring(openingIndex, closingIndex)

  // do variable replacements
  wiki = expandVariables(wiki, data.data)

  //remove {{}}'s and split based on pipes
  let arr = wiki.split(/\n\|/)
  //remove template name
  arr.shift()
  // some values can span more than one line if they have template, so we need to join these back together
  let fixedArr = []
  for (let i = 0; i < arr.length; i++) {
    let line = arr[i]
    let openingBrackets = (line.match(/{/g) || []).length
    let closingBrackets = (line.match(/}/g) || []).length
    while (openingBrackets > closingBrackets) {
      i++
      if (i >= arr.length) {
        break
      }
      let joinLine = arr[i]
      openingBrackets += (joinLine.match(/{/g) || []).length
      closingBrackets += (joinLine.match(/}/g) || []).length
      line += " " + joinLine
    }
    fixedArr.push(line)
  }
  arr = fixedArr

  let sentences = []
  let labels = {}
  let prefixes = {}
  let suffixes = {}
  let autoHeaders = false

  for (let i = 0; i < arr.length; i++) {
    let line = arr[i]
    let separatorIndex = line.indexOf("=")
    if (separatorIndex == -1) {
      continue
    }
    let key = line.substring(0, separatorIndex).trim()
    let value = line.substring(separatorIndex+1).trim()
    let data = {
      title: '',
      depth: null,
      wiki: value,
    }
    let section = new Section(data, doc)
    let valueText = section.text()
    if (!valueText) {
      continue
    }

    if (key == 'autoheaders' && valueText == 'y') {
      autoHeaders = true
    }

    //valueText = valueText.replace(/\s*?\n\s*/g, ' ')
    // replace div with newline
    if (!key.match(/^header\d+/)) {
      valueText = valueText.replace(/ ?< ?div [a-zA-Z0-9=%.\-#:;'" (),]{2,200}\/? ?> ?/g, '\n\n').replace(/\n\s+\n/g, '\n\n')
    }
    valueText = preProcess(valueText)
    valueText = valueText.replace(/\[\[File:.*?\]\]/g, '')
    if (valueText.startsWith('•')) {
      valueText = '-' + valueText.substring(1)
    }
    if (!valueText || valueText.includes("{{") || valueText.includes("}}")) {
      continue
    }
    if (key.match(/^image\d+/)) {
      // TODO
    } else if (key.match(/^caption\d+/)) {
      // TODO
    } else if (key.match(/^header\d+/)) {
      let prefix = prefixes[key.substring(6)] || ''
      if (sentences.length != 0) {
        prefix += '\n'
      }
      sentences.push(sentenceFromRaw(`${prefix}##### ${valueText}`))
    } else if (key.match(/^label\d+/)) {
      labels[key.substring(5)] = valueText
    } else if (key.match(/^data\d+/)) {
      let label = labels[key.substring(4)] || ''
      let prefix = prefixes[key.substring(4)] || ''
      if (!label.startsWith("-")) {
        prefix += '\n'
      }
      if (label) {
        label = label + ': '
      }
      let suffix = suffixes[key.substring(4)] || ''
      sentences.push(sentenceFromRaw(`${prefix}${label}${valueText}${suffix}`))
    } else if (key.match(/^rowclass\d+/)) {
      if (valueText == 'mergedtoprow') {
        //prefixes[key.substring(8)] = '\n'
      }
      if (valueText == 'mergedbottomrow') {
        //suffixes[key.substring(8)] = '\n'
      }
    }
  }

  // https://en.wikipedia.org/wiki/Template:Infobox#Hiding_headers_when_all_its_data_fields_are_empty
  // When true hides headers that don't have any rows
  if (autoHeaders) {
    let previousWasHeader = false
    let newSentences = []
    for (let sentence of sentences) {
      let text = sentence.text()
      let isHeader = text.includes("#####")
      if (isHeader && previousWasHeader) {
        // remove previous header
        newSentences.pop()
      }
      if (!text.includes('_BLANK_')) {
        previousWasHeader = isHeader
        newSentences.push(sentence)
      } else {
        // did add it so don't need to track it
        previousWasHeader = false
      }
    }
    if (previousWasHeader && newSentences.length > 0) {
      newSentences.pop()
    }
    sentences = newSentences
  }

  return new Paragraph({
    sentences: sentences,
    lists: [],
    references: []
  })
}
export default toMarkdown
