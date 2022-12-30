import wtf from './src/index.js'
import plg from './plugins/html/src/index.js'
wtf.plugin(plg)

let str = `= some heading =
after
`

str = `pre [[File:Foo.png]] post

pre [[:File:Foo.png]] post

pre [[File:Foo.png|Bar]] post

pre [[:File:Foo.png|Bar]] post
`

str = `
pre [[Category:Foo]] post

pre [[:Category:Foo]] post

pre [[Category:Foo|Bar]] post

pre [[:Category:Foo|Bar]] post
`
let doc = wtf(str)
console.log(doc.text())
// console.log('after')

// wtf.fetch('Dee-Ann Kentish-Rogers').then((doc) => {
// })

// wtf
//   .fetch(['Royal Cinema', 'Aldous Huxley'], {
//     lang: 'en',
//     'Api-User-Agent': 'spencermountain@gmail.com',
//   })
//   .then((docList) => {
//     let links = docList.map((doc) => doc.links())
//     console.log(links)
//   })