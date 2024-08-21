import Paragraph from './Paragraph.js'
import { fromText as parseSentence } from '../04-sentence/index.js'

const twoNewLines = /\r?\n\r?\n/
import parseImage from '../image/index.js'
import parseList from '../list/index.js'

const list_reg = /^[#*:;|]+/
const bullet_reg = /^\*+[^:,|]{4}/
const number_reg = /^ ?#[^:,|]{4}/
const has_word = /[\p{Letter}_0-9\]}]/iu

// does it start with a bullet point or something?
const isList = function (line) {
  return list_reg.test(line) || bullet_reg.test(line) || number_reg.test(line)
}

//make bullets/numbers into human-readable *'s
const cleanList = function (list) {
  let number = 1
  list = list.filter((l) => l && has_word.test(l))
  for (let i = 0; i < list.length; i++) {
    let line = list[i]
    //add # numberings formatting
    if (line.match(number_reg)) {
      line = line.replace(/^ ?#*/, number + '. ')
      line = line + '\n'
      number += 1
    } else if (line.match(list_reg)) {
      number = 1
      line = line.replace(list_reg, '- ')
    }
    list[i] = parseSentence(line)
  }
  return list
}


const parseParagraphs = function (section, doc) {
  let wiki = section._wiki
  let paragraphs = wiki.split(twoNewLines)
  //don't create empty paragraphs
  paragraphs = paragraphs.filter((p) => p && p.trim().length > 0)
  paragraphs = paragraphs.map((str) => {
    let paragraph = {
      wiki: str,
      lists: [],
      sentences: [],
      images: [],
    }
    //parse the lists
    //parseList(paragraph)
    //parse images
    parseImage(paragraph, doc)
    //parse the sentences
    //parseSentences(paragraph)

    let lines = str.split(/\n/g)
    let theRest = []
    let list = []
    for (let i = 0; i < lines.length; i++) {
      if (isList(lines[i])) {
        if (theRest.length > 0) {
          paragraph.sentences.push(parseSentence(theRest.join('\n')))
          theRest = []
        }
        list.push(lines[i])
      } else {
        if (list.length > 0) {
          paragraph.sentences.push(...cleanList(list))
          list = []
        }
        theRest.push(lines[i])
      }
    }
    if (list.length > 0) {
      paragraph.sentences.push(...cleanList(list))
    }
    if (theRest.length > 0) {
      paragraph.sentences.push(parseSentence(theRest.join('\n')))
    }

    return new Paragraph(paragraph)
  })
  paragraphs = paragraphs.filter((p) => p && p.sentences().length > 0)
  section._wiki = wiki
  section._paragraphs = paragraphs
}
export default parseParagraphs
