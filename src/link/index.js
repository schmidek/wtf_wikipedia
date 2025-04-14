import Link from './Link.js'
import parseLinks from './parse.js'

//return only rendered text of wiki links
const removeLinks = function (line) {
  // [[File:with|Size]]
  line = line.replace(/\[\[File:(.{2,80}?)\|([^\]]+)\]\](\w{0,5})/g, '')
  return line
}

const getLinks = function (data) {
  let wiki = data.text
  let links = parseLinks(wiki) || []
  data.links = links.map((link) => {
    let raw = link.raw
    link = new Link(link)
    let l = link.link()
    let markdown = `[${l.text || ''}](${l.url})`
    wiki = wiki.replace(raw, markdown)
    return link
  })
  wiki = removeLinks(wiki)
  data.text = wiki
}
export default getLinks
