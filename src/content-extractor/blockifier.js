import cheerio from 'cheerio'

const BLOCK_TAGS = new Set([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "div",
    "map",
    "span"
])


class Block{
    constructor(origin, parent){
        this.text = ""
        this.children = [] //children are more blocks
        this.tags = []
        this.origin = origin
        this.parent = parent
        
        this.golden = false

        this.features = []
    }

    to_training(){
        let explicit_cast = (bool) => bool ? 1 : 0
        return [this.features, explicit_cast(this.golden)]
    }
}

function HTMLToBlockCheerio(html_string){
    let $ = cheerio.load(html_string)
    let root = $.root()
    let first_block = new Block(root, null)
    let block_list = []
    blockifier_cheerio($, block_list, first_block, root[0])
    return [block_list, $]
}

//parent = parent block
//node = cheerio element
//global_block_list = array of blocks
function blockifier_cheerio($, global_block_list, parent, node){ 
    if(node.type == "text"){
        parent.text += node.data
        return;
    }
    else if (node.type == "tag" || node.type == "root"){
        if (BLOCK_TAGS.has(node.tagName)){
            let new_block = new Block(node, parent)
            global_block_list.push(new_block)
            $(node).contents().each((i, e) => {
                blockifier_cheerio($, global_block_list, new_block, e)
            })
            parent.children.push(new_block)
        }
        else{
            parent.tags.push(node)
            $(node).contents().each((i, e) => {
                blockifier_cheerio($, global_block_list, parent, e)
            })
        }
    }
}

export { Block, HTMLToBlockCheerio }