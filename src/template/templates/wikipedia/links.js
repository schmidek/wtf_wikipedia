const parse = require('../../_parsers/parse')

let templates = {}

//these are insane
// https://en.wikipedia.org/wiki/Template:Tl
const links = [
  'lts',
  't',
  'tfd links',
  'tiw',
  'tltt',
  'tetl',
  'tsetl',
  'ti',
  'tic',
  'tiw',
  'tlt',
  'ttl',
  'twlh',
  'tl2',
  'tlu',
  'demo',
  'hatnote',
  'xpd',
  'para',
  'elc',
  'xtag',
  'mli',
  'mlix',
  '#invoke',
  'url', //https://en.wikipedia.org/wiki/Template:URL
]

//keyValues
links.forEach((k) => {
  templates[k] = (tmpl) => {
    let order = ['first', 'second']
    let obj = parse(tmpl, order)
    return obj.second || obj.first
  }
})
//aliases
templates.m = templates.mention
templates['m-self'] = templates.mention
templates.l = templates.link
templates.ll = templates.link
templates['l-self'] = templates.link
module.exports = templates
