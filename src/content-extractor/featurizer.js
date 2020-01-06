/*
From each node, extract following features

1. depth
2. position (among siblings)
3. number of children 
4. text length (total in block)
5. total class attribute length (of all tags comprised in block)
6. average class attribute length <-- disable one if using linear model
7. number of classes (of all tags in block)
8. average number of classes
9. total id attribute length
10. average id attribute length

11. type of tag (that creates the block)
*/

/*

For up to 5 ancestors, extract the same information; no ancestor, pad with 0s

*/

/*

For each descendant layer, collect all of above except depth and position aggregated by level

*/

function feature_factory(featurizers){
    function DOMFeaturizer($, block){
        let features = []
        for(let f of featurizers){
            let feature_point = f($, block)
            features.push(feature_point)
        }
        return features
    }
    return DOMFeaturizer
}

function depth($, block){
    let node = block.origin
    return $(node).parents().length
}

function position($, block){
    let node = block.origin
    let count = 0
    while (node){
        node = node.previousSibling
        count += 1
    }
    return count
}

function total_length($, block){
    return block.text.length
}

function num_children($, block){
    return 1 + block.tags.length
}

function CTR($, block){
    //content to tag ratio

    function count_tags(node){
        let tag_content = $(node).attr('class') || ""
        tag_content += $(node).attr('id') || ""
        return tag_content.length
    }

    function count_text(node){
        return ($(node).text() || "").length
    }

    let sum = count_tags(block.origin)
    let text_sum = count_text(block.origin)
    for(let tag of block.tags){
        sum += count_tags(tag)
        text_sum += count_text(tag)
    }

    return sum / text_sum
}

function avg_class_length($, block){
    let class_origin = ($(block.origin).attr('class') || "").length
    let rest = class_origin
    for(let tag of block.tags){
        rest += ($(tag).attr('class') || "").length
    }
    return rest / num_children($, block)
}

function num_class($, block){
    let class_origin = ($(block.origin).attr('class') || "").split(" ").length
    let rest = class_origin
    for(let tag of block.tags){
        rest += ($(tag).attr('class') || "").split(" ").length
    }
    return rest / num_children($, block)
}

function avg_id_length($, block){
    let class_origin = ($(block.origin).attr('id') || "").length
    let rest = class_origin
    for(let tag of block.tags){
        rest += ($(tag).attr('id') || "").length
    }
    return rest / num_children($, block)
}

let per_node_features = [
    depth, 
    position,
    total_length, 
    num_children, 
    avg_class_length, 
    avg_id_length,
    CTR,
    num_class
]
let per_node = feature_factory(per_node_features)

function ancestor_features($, block){
    let current = block
    let features = []
    current = block.parent 
    let count = 0;
    while (count < 2){
        if (current){
            let feature = per_node($, current)
            features.push(...feature)
            current = current.parent
        } else {
            let f = []
            f.length = per_node_features.length
            f.fill(0)
            features.push(...f)
        }
        count += 1
    }

    return features
}

function depth_features($, block){
    //kinda jank but we can simulate blocks, which featurizers expect
    //with a duct typed dictionary with origin and tags (empty list)
    let node = block.origin

    let levels = []
    levels.length = 1;
    levels.fill([])

    function helper(node, height){
        if (!node || height >= 1){
            return
        }
        levels[height].push(node)
        $(node).children().each((i, e) => {
            helper(e, height + 1)
        })
    }

    helper(node, 0)

    let feat = []
    for(let level of levels){
        let level_CTR = 0;
        for(let child of level){
            let pseudo_block = {
                'origin': child,
                'tags': []
            }
            let child_features = CTR($, pseudo_block)
            level_CTR += child_features
        }
        level_CTR /= level.length
        feat.push(level_CTR)
    }

    if (feat.length == 0){
        return [0]
    }
    return feat
}

export { per_node, ancestor_features, depth_features }



