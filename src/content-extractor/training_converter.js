import { Block, HTMLToBlockCheerio } from './blockifier.js'
import { per_node, ancestor_features, depth_features } from './featurizer.js'

/*
Need to take a html file, and a text file of the "golden standard"
And save a a JSON file of blocks (in data representation) + list of labels
*/

function LCS(X, Y, key){ //Key is for X
    let m = X.length
    let n = Y.length

    //fill DP array
    let L = []
    for(let i = 0; i < m + 1; i++){
        let new_array = []
        new_array.length = n + 1
        new_array.fill(0)
        L.push(new_array) 
    }

    for(let i = 0; i < m + 1; i++){
        for(let j = 0; j < n + 1; j++){
            if (i === 0 || j === 0){
                L[i][j] = 0
            }
            else if (key(X[i-1]) === Y[j-1]){
                L[i][j] = L[i-1][j-1] + 1
            }
            else{
                L[i][j] = Math.max(L[i-1][j], L[i][j-1])
            }
        }
    }

    let index = L[m][n]
    let lcs = []
    lcs.length = index
    lcs.fill(null)

    let i = m
    let j = n 

    while(i > 0 && j > 0){
        if(key(X[i-1]) === Y[j-1]){
            lcs[index - 1] = X[i-1]
            i -= 1
            j -= 1
            index -= 1
        }
        else if (L[i-1][j] > L[i][j-1]){
            i -= 1
        }
        else{
            j -= 1
        }
    }

    return lcs
}

function equalizer(str){
    return str.trim().toLowerCase()
}

class Token{
    constructor(origin, text){
        this.origin = origin //block
        this.text = text //string
    }
}

function get_labels(blocks, golden_standard){
    //turn both blocks and golden_standard to tokens
    let block_tokens = []
    for(let block of blocks){
        let text_tokens = block.text.split("\n")
        for(let token of text_tokens){
            let t = new Token(block, equalizer(token))
            block_tokens.push(t)
        }
    }
    let golden_tokens = golden_standard.split("\n").map((str) => equalizer(str))
    let key = (token) => {
        if (typeof(token) === "string"){
            return token
        }
        else{
            return token.text
        }
    }

    let lcs = LCS(block_tokens, golden_tokens, key)
    for(let golden_token of lcs){
        golden_token.origin.golden = true
    }
    return lcs
}

function idk(html_string, golden_standard){
    //takes html string & golden standard
    //grabs features + get labels
    //returns blocks with labels

    let [blocks, $] = HTMLToBlockCheerio(html_string)
    let non_empty = blocks.filter((e) => 0 !== e.text.length)
    let golden_blocks = get_labels(non_empty, golden_standard)

    let features = []
    for(let block of non_empty){
        let block_feat = per_node($, block)
        block.features.push(...block_feat)
    }
    return non_empty
}



export { LCS, idk }

