import { trim_whitespace } from '../_lib/helpers.js'
import parseLinks from '../link/index.js'
import parseFmt from './formatting.js'
import Sentence from './Sentence.js'
import sentenceParser from './parse.js'

/**
 * This function removes some final characters from the sentence
 *
 * @private
 * @param {string} line the wiki text for processing
 * @returns {string} the processed string
 */
function postprocess(line) {
  //remove empty parentheses (sometimes caused by removing templates)
  line = line.replace(/\([,;: ]*\)/g, '')
  //these semi-colons in parentheses are particularly troublesome
  line = line.replace(/\( *(; ?)+/g, '(')
  //dangling punctuation
  line = trim_whitespace(line)
  line = line.replace(/ +\.$/, '.')
  return line
}

/**
 * returns one sentence object
 *
 * @param {string} str create a object from a sentence
 * @returns {Sentence} the Sentence created from the text
 */
function fromText(str) {
  let obj = {
    wiki: str,
    text: str,
  }
  //pull-out the [[links]]
  parseLinks(obj)
  obj.text = postprocess(obj.text)
  //pull-out the bolds and ''italics''
  obj = parseFmt(obj)
  //pull-out things like {{start date|...}}
  return new Sentence(obj)
}

/**
 * returns one sentence object
 *
 * @param {string} str create a object from a sentence
 * @returns {Sentence} the Sentence created from the text
 */
function fromRaw(str) {
  let obj = {
    wiki: str,
    text: str,
  }
  return new Sentence(obj)
}

//used for consistency with other class-definitions
const byParagraph = function (paragraph) {
  //array of texts
  let sentences = sentenceParser(paragraph.wiki)
  //sentence objects
  sentences = sentences.map(fromText)
  //remove :indented first line, as it is often a disambiguation
  if (sentences[0] && sentences[0].text() && sentences[0].text()[0] === ':') {
    sentences = sentences.slice(1)
  }
  paragraph.sentences = sentences
}

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
  list = list.filter((l) => l)
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

export { fromText, byParagraph, fromRaw }
