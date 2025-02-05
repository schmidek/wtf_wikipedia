import test from 'tape'
import wtf from '../lib/index.js'
import readFile from '../lib/_cachedPage.js'

test('bluejays table', (t) => {
  const arr = readFile('bluejays').table(0).data
  t.equal(arr.length, 8, 'table-length-bluejays')
  t.equal(arr[0]['Level'].text(), 'AAA', 'level-col')
  t.equal(arr[0]['Team'].text(), 'Buffalo Bisons', 'team-col')
  t.equal(arr[0]['League'].text(), 'International League', 'league-col')
  t.equal(arr[1]['Location'].text(), 'Manchester, New Hampshire', 'location-col')
  t.end()
})

test('rnli stations', (t) => {
  const doc = readFile('rnli_stations')
  t.equal(doc.categories().length, 5, 'cat-length')

  const intro = doc.section(0)
  t.equal(intro.title(), '', 'intro-title')
  t.equal(intro.images().length > 0, true, 'intro-image-length')
  t.equal(intro.sentences().length > 0, true, 'intro-sentence-length')

  const key = doc.section(1)
  t.equal(key._depth, 0, 'key-depth')
  t.equal(key.title(), 'Key', 'key-title')
  t.equal(key.sentences().length, 0, 'key-no-sentences')
  t.deepEqual(key.images(), [], 'key-no-images')
  t.deepEqual(key.templates(), [], 'key-no-templates')
  t.deepEqual(key.lists(), [], 'key-no-lists')
  t.deepEqual(key.tables(), [], 'key-no-tables')

  const lifeboat = doc.section(2)
  t.equal(lifeboat._depth, 1, 'lifeboat-depth')
  t.equal(lifeboat.template().json().list[0], 'Royal National Lifeboat Institution lifeboats', 'lifeboat-main')
  t.equal(lifeboat.list().json().length, 3, 'lifeboat-list')
  t.equal(lifeboat.sentences().length, 3, 'lifeboat-sentences')
  t.deepEqual(lifeboat.images(), [], 'lifeboat-no-images')
  t.deepEqual(lifeboat.tables(), [], 'lifeboat-no-tables')

  const east = doc.section(6)
  t.equal(east.title(), 'East Division', 'East Division')
  t.deepEqual(east.images(), [], 'East-no-images')
  t.deepEqual(east.lists(), [], 'East-no-lists')
  t.equal(east.sentences().length, 0, 'east-sentences')

  const table = east.table(0).data
  t.equal(table.length, 42, 'east table-rows')
  t.equal(table[0].Location.text(), 'Hunstanton, Norfolk', 'east-table-data')
  t.equal(table[41]['Launch method'].text(), 'Carriage', 'east-table-data-end')

  const south = doc.section(7)
  const sTable = south.table(0).data
  t.equal(sTable.length, 35, 'south-table-rows')
  t.equal(sTable[0].Location.text(), 'Mudeford, Dorset', 'south-table-data')
  t.end()
})

//https://en.wikipedia.org/wiki/Help:Table
test('simple table', (t) => {
  const simple = `{| class="wikitable"
|-
! Header 1
! Header 2
! Header 3
|-
| row 1, cell 1
| row 1, cell 2
| row 1, cell 3
|-
| row 2, cell 1
| row 2, cell 2
| row 2, cell 3
|}`
  const obj = wtf(simple)
  const table = obj.table(0).data
  t.equal(table.length, 2, '2 rows')
  t.equal(table[0]['Header 1'].text(), 'row 1, cell 1', '1,1')
  t.equal(table[0]['Header 2'].text(), 'row 1, cell 2', '1,2')
  t.equal(table[0]['Header 3'].text(), 'row 1, cell 3', '1,3')
  t.equal(table[1]['Header 1'].text(), 'row 2, cell 1', '2,1')
  t.equal(table[1]['Header 2'].text(), 'row 2, cell 2', '2,2')
  t.equal(table[1]['Header 3'].text(), 'row 2, cell 3', '2,3')
  t.end()
})

test('multiplication table', (t) => {
  const mult = `{| class="wikitable" style="text-align: center; width: 200px; height: 200px;"
|+ Multiplication table
|-
! ×
! 1
! 2
! 3
|-
! 1
| 1 || 2 || 3
|-
! 2
| 2 || 4 || 6
|-
! 3
| 3 || 6 || 9
|-
! 4
| 4 || 8 || 12
|-
! 5
| 5 || 10 || 15
|}`
  const obj = wtf(mult)
  const table = obj.table(0).data
  t.equal(table[0]['1'].text(), '1', '1x1')
  t.equal(table[1]['1'].text(), '2', '1x2')
  t.equal(table[1]['2'].text(), '4', '2x2')
  t.end()
})

test('inline-table-test', (t) => {
  const inline = `{| class="wikitable"
|+ style="text-align: left;" | Data reported for 2014–2015, by region<ref name="Garcia 2005" />
|-
! scope="col" | Year !! scope="col" | Africa !! scope="col" | Americas !! scope="col" | Asia & Pacific !! scope="col" | Europe
|-
! scope="row" | 2014
| 2,300 || 8,950 || ''9,325'' || 4,200
|-
! scope="row" | 2015
| 2,725 || ''9,200'' || 8,850 || 4,775
|}`
  const obj = wtf(inline)
  const table = obj.table(0).data
  t.equal(table[0].Year.text(), '2014', 'first year')
  t.equal(table[0].Africa.text(), '2,300', 'africa first-row')
  t.equal(table[0].Americas.text(), '8,950', 'america first-row')
  t.equal(table[1].Europe.text(), '4,775', 'europe second-row')
  t.end()
})

test('floating-tables-test', (t) => {
  //we don't (and probably can't) fully support this rn
  const floating = `{| class="wikitable floatright"
| Col 1, row 1
| rowspan="2" | Col 2, row 1 (and 2)
| Col 3, row 1
|-
| Col 1, row 2
| Col 3, row 2
|}
{| class="wikitable floatleft"
| Col 1, row 1
| rowspan="2" | Col 2, row 1 (and 2)
| Col 3, row 1
|-
| Col 1, row 2
| Col 3, row 2
|}`
  const obj = wtf(floating)
  t.equal(obj.tables().length, 2, 'two tables')
  const table = obj.table(0).data
  t.equal(table[0]['col1'].text(), 'Col 1, row 1', '1,1')
  t.end()
})

test('wikisortable-tables-test', (t) => {
  //we don't (and probably can't) fully support this rn
  const sortable = `{| class="wikitable sortable"
|+ Sortable table
|-
! scope="col" | Alphabetic
! scope="col" | Numeric
! scope="col" | Date
! scope="col" class="unsortable" | Unsortable
|-
| d || 20 || 2008-11-24 || This
|-
| b || 8 || 2004-03-01 || column
|-
| a || 6 || 1979-07-23 || cannot
|-
| c || 4 || 1492-12-08 || be
|-
| e || 0 || 1601-08-13 || sorted.
|}`
  const obj = wtf(sortable)
  t.equal(obj.tables().length, 1, 'one table')
  const table = obj.table(0).data
  t.equal(table[0]['Alphabetic'].text(), 'd', '1,1')
  t.equal(table[0]['Numeric'].text(), '20', '1,2')
  t.equal(table[0]['Date'].text(), '2008-11-24', '1,3')
  t.equal(table[0]['Unsortable'].text(), 'This', '1,4')
  t.equal(table[1]['Alphabetic'].text(), 'b', '2,1')
  t.equal(table[2]['Alphabetic'].text(), 'a', '3,1')
  t.equal(table[3]['Alphabetic'].text(), 'c', '4,1')
  t.equal(table[4]['Alphabetic'].text(), 'e', '5,1')
  t.end()
})

test('messy-table-test', (t) => {
  const messy = ` {| class="wikitable"
     |[[File:Worms 01.jpg|199x95px]]
      |[[File:Worms Wappen 2005-05-27.jpg|199x95px]]
  |<!--col3-->[[File:Liberty-statue-with-manhattan.jpg|199x95px]]
  |<!--col4-->[[File:New-York-Jan2005.jpg|100x95px]]<!--smaller-->


    |-
  |<!--col1-->Nibelungen Bridge to Worms
  |Worms and its sister cities
  |Statue of Liberty
  |New York City
 |}`
  const obj = wtf(messy)
  const table = obj.table(0).json()
  t.equal(table[1]['col1'].text, 'Nibelungen Bridge to Worms', 'col1 text')
  //const keyVal=obj.tables(0).keyValue()
  //t.equal()
  t.end()
})

test('embedded-table', (t) => {
  const str = ` {|
  | one
  | two
  | three
  |-
  {|
  | inside one
  | inside two
  | inside [[three]]
  |}
  |Statue of Liberty
  |New York City
  |[[Chicago]]
  |}
  `
  const tables = wtf(str).tables()
  t.equal(tables.length, 2, 'found both tables')
  t.equal(tables[0].links().length, 1, 'found one link')
  t.equal(tables[1].links().length, 1, 'found another link')
  t.end()
})

test('embedded-table-2', (t) => {
  const str = ` {| class="oopsie"
  | first row
  |-
  | Secod row
  {|
  |-
  | embed 1
  |-
  | embed 2
  |}
  |-
  | Berlin!
  |-
  |}

  Actual first sentence is here`
  const doc = wtf(str)
  t.equal(doc.tables().length, 2, 'found both tables')
  const text = doc.sentence().text()
  t.equal('Actual first sentence is here', text, 'got proper first sentence')
  t.end()
})

test('sortable table', (t) => {
  const str = `{|class="wikitable sortable"
  !Name and Surname!!Height
  |-
  |data-sort-value="Smith, John"|John Smith||1.85
  |-
  |data-sort-value="Ray, Ian"|Ian Ray||1.89
  |-
  |data-sort-value="Bianchi, Zachary"|Zachary Bianchi||1.72
  |-
  !Average:||1.82
  |}`
  const doc = wtf(str)
  const row = doc.table(0).data[0]
  t.equal(row.Height.text(), '1.85', 'got height')
  t.equal(row['Name and Surname'].text(), 'John Smith', 'got name')
  t.end()
})

test('missing-row test', (t) => {
  const str = `{|class="wikitable"
  |-
  ! style="background:#ddf; width:0;"| #
  ! style="background:#ddf; width:11%;"| Date
  ! style="background:#ddf; width:14%;"| Opponent
  ! style="background:#ddf; width:9%;"| Score
  ! style="background:#ddf; width:18%;"| Win
  ! style="background:#ddf; width:18%;"| Loss
  ! style="background:#ddf; width:16%;"| Save
  ! style="background:#ddf; width:0;"| Attendance
  ! style="background:#ddf; width:0;"| Record
  |-align="center" bgcolor="bbffbb"
  | 2 || April 2 || @ [[2014 New York Mets season|Mets]] || 5–1 || '''[[Gio González|González]]''' (1–0) || [[Bartolo Colón|Colón]] (0–1) || || 29,146 || 2–0
  |-align="center" bgcolor="bbffbb"
  | 3 || April 3 || @ [[2014 New York Mets season|Mets]] || 8–2 || '''[[Tanner Roark|Roark]]''' (1–0) || [[Zack Wheeler|Wheeler]] (0–1) || || 20,561 || 3–0
  |-align="center" bgcolor="ffbbbb"
  | 4 || April 4 || [[2014 Atlanta Braves season|Braves]] || 2–1 || [[Luis Avilán|Avilán]] (1–0) || '''[[Tyler Clippard|Clippard]]''' (0–1) || [[Craig Kimbrel|Kimbrel]] (3) || 42,834 || 3–1
  |-align="center" bgcolor="ffbbbb"
  | 5 || April 5 || [[2014 Atlanta Braves season|Braves]] || 6–2 || [[Julio Teherán|Teherán]] (1–1) || '''[[Stephen Strasburg|Strasburg]]''' (0–1) || || 37,841 || 3–2
  |-align="center" bgcolor="bbffbb"
  |}
  Actual first sentence  is here`
  const row = wtf(str).table(0).data[0]
  t.equal(row.Save.text(), '', 'got empty property')
  t.equal(row.Record.text(), '2–0', 'got last property')
  t.end()
})

test('table newline removal', (t) => {
  const str = `hello this is the top
{| class="wikitable" style="font-size: 95%;"
| 1
| [[Daugpiļs]]
|-
| 2
| [[Jākubmīsts]]
|-
| 3
| [[Rēzne]]
|}
`
  const doc = wtf(str)
  t.equal(doc.text(), 'hello this is the top', 'text on top')
  t.end()
})

test('table rowspan', (t) => {
  const str = `{| class="wikitable"
| rowspan="2"| one
| two
| three
|-
| two B
| three B
|}`
  const doc = wtf(str)
  const table = doc.table(0).keyValue()
  t.equal(table[0].col1, 'one', 'has init')
  t.equal(table[1].col1, 'one', 'has copy')
  t.equal(table[0].col2, 'two', 'has later')
  t.equal(table[0].col3, 'three', 'has later')
  t.equal(table[1].col2, 'two B', 'has later 1')
  t.equal(table[1].col3, 'three B', 'has later 2')
  t.end()
})

test('table colspan', (t) => {
  const str = `{| class="wikitable"
| colspan="2" style="text-align:center;"| one/two
| three
|-
| one B
| two B
| three B
|}`
  const doc = wtf(str)
  const table = doc.table(0).keyValue()
  t.equal(table[0].col1, 'one/two', 'has init')
  t.equal(table[0].col2, '', 'has empty span')
  t.equal(table[0].col3, 'three', 'has after span')

  t.equal(table[1].col1, 'one B', 'has one b')
  t.equal(table[1].col2, 'two B', 'has two B')
  t.equal(table[1].col3, 'three B', 'has three C')
  t.end()
})

//use first row as the table header
test('first-row as header', (t) => {
  const simple = `{| class="wikitable"
|-
| Name
| Country
| Rank
|-
| spencer || canada || captain
|-
| john || germany || captain
|-
| april || sweden || seargent
|-
| may || sweden || caption
|}`
  const obj = wtf(simple)
  const table = obj.table(0).json()
  t.equal(table.length, 4, '4 rows')
  t.equal(table[0]['name'].text, 'spencer', 'got name 1')
  t.equal(table[0]['country'].text, 'canada', 'got country 1')
  t.equal(table[0]['rank'].text, 'captain', 'got rank 1')
  t.equal(table[2]['rank'].text, 'seargent', 'got rank 3')
  t.end()
})

//two-row header composite
test('two-rows as header', (t) => {
  const str = `{| class="wikitable"
  |-
  ! A
  ! B
  ! C
  ! D
  |-
  !
  !
  !
  ! D2
  ! E2
  |-
  | a || b || c || d || e
  |}`
  const table = wtf(str).table(0).keyValue()
  t.equal(table.length, 1, '1 row')
  t.equal(table[0].A, 'a', 'got col 1')
  t.equal(table[0].D2, 'd', 'got col d2')
  t.equal(table[0].E2, 'e', 'got col e2')
  t.end()
})

//two-row header with spans
test('two-header-rows-with-spans', (t) => {
  const str = `{| class="wikitable"
  |-
  ! A
  ! B
  ! rowspan="2" | C
  ! colspan="3" | D
  |-
  !
  !
  ! D2
  ! E2
  |-
  | a || b || c || d || e
  |}`
  const table = wtf(str).table(0).keyValue()
  t.equal(table.length, 1, '1 row')
  t.equal(table[0].A, 'a', 'got col 1')
  t.equal(table[0].C, 'c', 'got col c')
  t.equal(table[0].D2, 'd', 'got col d2')
  t.equal(table[0].E2, 'e', 'got col e2')
  t.end()
})

//nfl football table
test('junky-table', (t) => {
  const str = `{| class="navbox plainrowheaders wikitable" style="width:100%"
! A
! B
! C
! D
|-
!style="{{Gridiron primary style|AFC}};" colspan="8"|[[American Football Conference|<span style="{{Gridiron secondary color|AFC}};">American Football Conference</span>]]
|-
!style=background:white rowspan="4"|[[AFC East|East]]
|'''[[Buffalo Bills]]'''
|[[Orchard Park (town), New York|Orchard Park, New York]]
|-
|'''[[Miami Dolphins]]'''
|[[Miami Gardens, Florida]]
|[[Hard Rock Stadium]]
|-
|}`
  const table = wtf(str).table(0).keyValue()
  t.equal(table.length, 2, '2 row2')
  t.equal(table[0].A, 'East', 'got col a1')
  t.equal(table[0].C, 'Orchard Park, New York', 'got col c1')
  t.equal(table[1].A, 'East', 'got col a2')
  t.equal(table[1].D, 'Hard Rock Stadium', 'got col c2')
  t.end()
})

test('table double bar', (t) => {
  const str = `{| class="wikitable"
|-
! h1
! h2
! h3
|-
| a
| aa
| aaa
|-
| b || bb || bbb
|-
| c
|| cc
|| ccc
|}`
  const doc = wtf(str)
  const data = doc.table(0).keyValue()
  t.equal(data[0].h1, 'a', 'h1')
  t.equal(data[0].h2, 'aa', 'h2')
  t.equal(data[0].h3, 'aaa', 'h3')
  t.equal(data[1].h1, 'b', 'h1')
  t.equal(data[1].h2, 'bb', 'h2')
  t.equal(data[1].h3, 'bbb', 'h3')
  t.equal(data[2].h1, 'c', 'h1')
  t.equal(data[2].h2, 'cc', 'h2')
  t.equal(data[2].h3, 'ccc', 'h3')
  t.end()
})

//testing https://github.com/spencermountain/wtf_wikipedia/issues/332
test('table newline', (t) => {
  const str = `{| class="wikitable"
|-
! h1
! h2
! h3
|-
| a
| b1<br />b2
| c
|-
| a
| b1
b2
| c
|}`
  const doc = wtf(str)
  const data = doc.table(0).keyValue()
  t.equal(data[0].h1, 'a', 'h1')
  t.equal(data[0].h2, 'b1 b2', 'h2')
  t.equal(data[0].h3, 'c', 'h3')
  t.equal(data[0].h1, 'a', 'h1')
  t.equal(data[0].h2, 'b1 b2', 'h2')
  t.equal(data[0].h3, 'c', 'h3')
  t.end()
})

test('multiple pipes in a cell', (t) => {
  const str = `{|
  | styling | content | more content
  |-
  || content | more content
  |}`
  const table = wtf(str).table(0).keyValue()
  t.equal(table[0].col1, 'content | more content', 'col1')
  t.equal(table[1].col1, 'content | more content', 'col1 row2')
  t.end()
})

test('empty cells', (t) => {
  // Actually rendered table:
  // A | B | C | D |   | F |   |   | I |   | K
  //   | b |   | d | e | f | g | h | i | j | k
  //   |   | c |   | e
  const str = `{| class="wikitable"
  ! A
  ! B
  ! C
  ! D
  !!! F
  !!!!! I !!!! K
  |-
  ||| b |||| d || e || f || g || h || i || j || k
  |-
  ||||| c
  |||| e
  |}`
  const table = wtf(str).table(0).keyValue()
  t.equal(table[0].A, '', 'a1')
  t.equal(table[0].B, 'b', 'b1')
  t.equal(table[0].C, '', 'c1')
  t.equal(table[0].D, 'd', 'd1')
  t.equal(table[0].col5, 'e', 'e1')
  t.equal(table[0].F, 'f', 'f1')
  t.equal(table[0].col7, 'g', 'g1')
  t.equal(table[0].col8, 'h', 'h1')
  t.equal(table[0].I, 'i', 'i1')
  t.equal(table[0].col10, 'j', 'j1')
  t.equal(table[0].K, 'k', 'k1')
  t.equal(table[1].A, '', 'a2')
  t.equal(table[1].B, '', 'b2')
  t.equal(table[1].C, 'c', 'c2')
  t.equal(table[1].D, '', 'd2')
  t.equal(table[1].col5, 'e', 'e2')
  t.end()
})

test('generated table', (t) => {
  let str = `
{{CBB roster/Header|year=|team=|sex=}}
{{CBB roster/Player|first=Demetrius|last=McReynolds|num=1|pos=G|ft=6|in=2|lbs=210|class=sr|rs=|home=[[Louisville, Kentucky]]}}
{{CBB roster/Footer}}`
  let doc = wtf(str)
  t.equal(doc.tables().length, 1, 'cbb roster')
  t.end()
})

test('html table', (t) => {
  const str = `<table border="1">
<tr>
<th>h1</th>
<th>h2</th>
</tr>
<tr>
<td>a</td>
<td>b</td>
</tr>
</table>`
  const doc = wtf(str)
  const table = doc.table(0).keyValue()
  t.equal(table.length, 1, '1 rows')
  t.equal(table[0].h1, 'a')
  t.equal(table[0].h2, 'b')
  t.end()
})


// BBC's_100_Greatest_Films_of_the_21st_Century
test('mixed html table', (t) => {
  const str = `{| class="wikitable sortable"
! No. !! Title !! Director !! Country !! Year </tr>
| 1 ||''[[Mulholland Drive (film)|Mulholland Drive]]''<td>[[David Lynch]]</td><td>United States, France</td><td> 2001 </tr>
| 2 || ''[[In the Mood for Love]]'' || [[Wong Kar-wai]] ||Hong Kong, France <td> 2000 </td></tr>
| 3 || ''[[There Will Be Blood]]'' || [[Paul Thomas Anderson]] ||United States || 2007 </tr>
| 4 || ''[[Spirited Away]]'' || [[Hayao Miyazaki]] || Japan ||2001 </tr>
| 5 || ''[[Boyhood (2014 film)|Boyhood]]'' || [[Richard Linklater]] || rowspan="3"|United States || 2014 </tr>
| 6 || ''[[Eternal Sunshine of the Spotless Mind]]'' || [[Michel Gondry]] ||2004 </tr>
| 7 || ''[[The Tree of Life (film)|The Tree of Life]]'' || [[Terrence Malick]] || 2011 </tr>
| 8 || ''[[Yi Yi]]'' || [[Edward Yang]] || Taiwan, Japan || 2000 </tr>
| 9 || ''[[A Separation]]'' || [[Asghar Farhadi]] || Iran || 2011 </tr>
| 10 || ''[[No Country for Old Men (film)|No Country for Old Men]]'' <td> [[Joel Coen]] and [[Ethan Coen]] </td>|| United States || 2007 </tr>
|}`
  const doc = wtf(str)
  const table = doc.table(0).keyValue()
  t.equal(table.length, 10, '10 rows')
  t.equal(table[0]["No."], '1')
  t.equal(table[0]["Year"], '2001')
  t.equal(table[9]["No."], '10')
  t.equal(table[9]["Year"], '2007')
  t.end()
})
