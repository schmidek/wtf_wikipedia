import { fromText as parseSentence } from '../04-sentence/index.js'
import cleanup from '../template/parse/toJSON/03-cleanup.js'
import Section from '../02-section/Section.js'
import preProcess from '../01-document/preProcess/index.js'

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
          const variable = separatorIndex == -1 ? stringToExpand : stringToExpand.substring(0, separatorIndex)
          let expanded = ""
          if (variable in data) {
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
  // some templates have everything within <includeonly></includeonly>
  let opening = '<includeonly>'
  let openingIndex = wiki.indexOf(opening)
  if (openingIndex != -1) {
    let closingIndex = wiki.indexOf('</includeonly>')
    wiki = wiki.substring(openingIndex + opening.length, closingIndex)
  }

  // do variable replacements
  wiki = expandVariables(wiki, data.data)

  //remove {{}}'s and split based on pipes
  let arr = wiki.split(/\n\|/)
  //remove template name
  arr.shift()

  let markdown = ''
  let labels = {}
  let prefixes = {}
  let suffixes = {}
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
    //valueText = valueText.replace(/\s*?\n\s*/g, ' ')
    // replace div with newline
    if (!key.startsWith("header")) {
      valueText = valueText.replace(/ ?< ?div [a-zA-Z0-9=%.\-#:;'" ]{2,100}\/? ?> ?/g, '\n\n')
    }
    valueText = preProcess(valueText)
    valueText = valueText.replace(/\[\[File:.*?\]\]/g, '')
    if (valueText.startsWith('•')) {
      valueText = '-' + valueText.substring(1)
    }
    if (key.startsWith('image')) {
      // TODO
    } else if (key.startsWith('caption')) {
      // TODO
    } else if (key.startsWith('header')) {
      let prefix = prefixes[key.substring(6)] || ''
      markdown += `\n${prefix}##### ${valueText}\n`
    } else if (key.startsWith('label')) {
      labels[key.substring(5)] = valueText
    } else if (key.startsWith('data')) {
      let label = labels[key.substring(4)] || ''
      let prefix = prefixes[key.substring(4)] || ''
      if (!label.startsWith("-")) {
        prefix += '\n'
      }
      if (label) {
        label = label + ': '
      }
      let suffix = suffixes[key.substring(4)] || ''
      markdown += `${prefix}${label}${valueText}\n${suffix}`
    } else if (key.startsWith('rowclass')) {
      if (valueText == 'mergedtoprow') {
        //prefixes[key.substring(8)] = '\n'
      }
      if (valueText == 'mergedbottomrow') {
        //suffixes[key.substring(8)] = '\n'
      }
    }
  }

  return markdown.trim()
}
export default toMarkdown
