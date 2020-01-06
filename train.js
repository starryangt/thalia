import fs, { readdirSync } from 'fs'
import path from 'path'

import ml_random_forest from 'ml-random-forest';
const { RandomForestClassifier } = ml_random_forest

import pca from 'ml-pca'
const { PCA } = pca

import matrix from 'ml-matrix'
const { Matrix } = matrix

const file_path = './training_data/Custom/'

let list_of_training = fs.readFileSync('./training_data/training.txt', 'utf-8')
let list_of_test = fs.readFileSync('./training_data/test.txt', 'utf-8')

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function load_files(list_of_files){
    let x = []
    let y = []
    for(let f of list_of_files){
        let pre_json = fs.readFileSync(path.join(file_path, f + ".html.json"), "utf-8")
        let json = JSON.parse(pre_json)
        
        x.push(...(json.X.map(e => e)))
        y.push(...json.y)
    }

    return [x, y]
}

let [training_X, training_y] = load_files(getRandomSubarray(list_of_training.split("\n"), 300))

let p = new PCA(training_X, { 'nCompNIPALS': 5, 'method': 'NIPALS'})
let new_X = p.predict(training_X)

var options = {
    seed: 42,
    maxFeatures: 5,
    replacement: true,
    nEstimators: 10
  };

let classifier = new RandomForestClassifier(options)
console.log("Training...")
let previous_time = Date.now()
classifier.train(new_X, training_y)
let diff = Date.now() - previous_time
console.log("Finished training, took " + (diff / 1000) + " seconds")

console.log("Testing training accuracy")
let [test_X, test_y] = load_files(list_of_test.split("\n"))
let new_PX = p.predict(test_X)
let result = classifier.predict(new_PX)

let true_positive = 0
let false_positive = 0
let false_negative = 0

for(let i = 0; i < result.length; i++){
    if(result[i] === test_y[i]){
        if (result[i] == 1){
            true_positive++
        }
    }
    else{
        if (result[i] === 1){
            false_positive++
        }
        else{
            false_negative++
        }
    }
}

let precision = true_positive / (true_positive + false_positive)
let recall = true_positive / (true_positive + false_negative)
let F1 = 2 * ((precision * recall) / (precision + recall))
console.log("Final Test F1 Score: " + F1)

let PCASerialized = JSON.stringify(p)
let serialized = JSON.stringify(classifier)
let date = Date.now()
fs.writeFileSync(`./${date}_RFModel`, serialized)
fs.writeFileSync(`./${date}_PCAModel`, PCASerialized)