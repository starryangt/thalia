import GetExtractor from './html-extractor.js'
import cheerio from 'cheerio'
import { Block, HTMLToBlockCheerio } from './blockifier.js'
import { per_node, ancestor_features, depth_features } from './featurizer.js'
import { LCS, idk } from './training_converter.js'
import fs from 'fs'

const url = "https://silveredtongue.wordpress.com/2019/08/03/volume-16-gevaudan-of-the-star-fortress-chapter-three-then-end-of-retreat-bourtange/"
const test = "<html><body><div>Hey there<p>y ou're a rockstar</p></div></body></html>"
async function do_something(){
    let g = new GetExtractor()
    let content = await g.get_url(url)
    let [blocks, $] = HTMLToBlockCheerio(content)
    let block1 = blocks[125]
    let data = per_node($, block1)
    console.log(data.length)

    let data2 = ancestor_features($, block1)
    console.log(data2.length)

    let data3 = depth_features($, block1)
    console.log(data3) 
}


function something_else(){
    let test = '<html><p class="a b">LOL</p></html>'
    let $ = cheerio.load(test)
    let p = $('p').first()
    console.log('wtf')
    console.log($('p').attr('class'))
}

//do_something()
//something_else()

let html = fs.readFileSync('./training_data/HTML/9.html', "utf8")
let correct = fs.readFileSync('./training_data/Corrected/9.html.corrected.txt', "utf8")
let thing = idk(html, correct)
console.log(thing)