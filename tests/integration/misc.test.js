import test from 'tape'
import wtf from '../lib/index.js'

test('small headings', (t) => {
  const str = `
hello
===gdbserver===
hi there

===x===
Displays memory at the specified virtual address using the specified format.

===xp===
here too
  `
  const sections = wtf(str).sections()
  t.equal(sections[1].title(), 'gdbserver', 'first heading exists')
  t.equal(sections[2].title(), 'x', 'x exists')
  t.ok(sections[3].title, 'xp', 'xp exists')
  t.equal(sections[4], undefined, 'foo doesnt exist')
  t.end()
})

test('font-size', (t) => {
  let str = 'hello {{small|(1995-1997)}} world'
  t.equal(wtf(str).plaintext(), 'hello (1995-1997) world', '{{small}}')

  str = 'hello {{huge|world}}'
  t.equal(wtf(str).text(), 'hello world', '{{huge}}')

  str = `hello {{nowrap|{{small|(1995–present)}}}} world`
  t.equal(wtf(str).plaintext(), 'hello (1995–present) world', '{{nowrap}}')
  t.end()
})

test('external links', (t) => {
  let str = `The [http://w110.bcn.cat/portal/site/Eixample] is the quarter designed`
  let obj = wtf(str)
  let link = obj.sentence().link()
  t.equal(link.text(), '', 'link-text')
  t.equal(link.site(), 'http://w110.bcn.cat/portal/site/Eixample', 'link-site')
  t.equal(link.type(), 'external', 'link-type')

  str = `The [http://w110.bcn.cat/portal/site/Eixample Fun Times] is the quarter designed`
  obj = wtf(str)
  link = obj.sentence().link()
  t.equal(link.text(), 'Fun Times', 'link-text')
  t.equal(link.site(), 'http://w110.bcn.cat/portal/site/Eixample', 'link-site')
  t.equal(link.type(), 'external', 'link-type')
  t.end()
})

test('ref templates', (t) => {
  const arr = [
    [`hello {{tag|ref|content=haha}} world`, 'haha'],
    [`{{tag|ref|content=haha}}`, 'haha'],
  ]
  arr.forEach((a) => {
    const doc = wtf(a[0])
    const arr = doc.citations()
    t.equal(arr.length, 1, 'found-inline-citations')
    t.equal(arr[0].json().inline.text(), a[1], 'inline-text')
  })
  t.end()
})

test('misc templates', (t) => {
  const arr = [
    [`hello {{refn|group=groupname|name=name|Contents of the footnote}} world`, 'hello world'],
    [`hello {{tag|ref|content=haha}} world`, 'hello world'],
    [`{{convert|70|m}}`, '70 m'],
    [`{{convert|7|and|8|km}}`, '7 and 8 km'],
    [`{{convert|7|to|8|mi}}`, '7 to 8 mi'],
    [`{{ill|Joke|fr|Blague|hu|Vicc|de|Witz}}`, 'Joke'],
    [`hello {{small|2 February}}`, 'hello 2 February'],
    [`{{tiw|Hatnote}}`, 'Hatnote'],
    [`{{date|June 8 2018|mdy}}`, 'June 8 2018'],
    [`{{IPA|/ˈkærəktɚz/}}`, ''],
    [`{{IPAc-ar|2|a|l|l|u|gh|a|t_|a|l|3|a|r|a|b|i|y|y|a}}`, ''],
    [`{{dts|July 1, 1867}}`, 'July 1, 1867'],
    [`{{dts|2024|Jun|12}}`, 'Jun 12 2024'],
    [`{{dts|-200}}`, '200 BC'],
    [`{{dts|2020-10-15|format=dm}}`, '2020-10-15'],
    [`{{dts|2000-03-02|abbr=on}}`, '2000-03-02'],
    [`{{tag|div|content=haha}}`, 'haha'],
    [`{{first word|Foo bar baz}}`, 'Foo'],
    [`{{Trunc | Lorem ipsum dolor sit amet | 10 }}`, 'Lorem ipsu'],
    [`{{str mid|Abcdefghijklmnopqrstuvwxyz|5|3}}`, 'efg'],
    [`{{plural|1|page}}`, '1 page'],
    [`{{plural|1.5|page}}`, '1.5 pages'],
    [`{{plural|20|fly}}`, '20 flies'],
    [`{{hlist|Winner|Runner-up|Third place|item_style=color:blue;|indent=2}}`, 'Winner · Runner-up · Third place'],
    [
      `{{block indent |1=The material to be indented here. May include markup, paragraph breaks, etc.}}`,
      'The material to be indented here. May include markup, paragraph breaks, etc.',
    ],
    [`{{Ordered list |entry1 |entry2| entry3 }}`, '1. entry1\n\n2. entry2\n\n3. entry3'],
    [`{{unbulleted list|first item|second item|third item}}`, 'first item\n\nsecond item\n\nthird item'],
  ]
  arr.forEach((a) => {
    const str = wtf(a[0]).plaintext()
    t.equal(str, a[1], a[0].substr(2, 12).replace(/\|.*/, ''))
  })
  // const str = ` {{Monthyear}}`;
  // const str = ` {{Time ago| Jan 6 2018|magnitude=weeks}}`;
  t.end()
})
