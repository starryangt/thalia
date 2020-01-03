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

let [training_X, training_y] = load_files(list_of_training.split("\n"))

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
let correct = 0
let total = 0
for(let i = 0; i < result.length; i++){
    if(result[i] === test_y[i]){
        correct += 1
    }
    total += 1
}
console.log("Final Test Accuracy: " + (correct / total))

let PCASerialized = JSON.stringify(p)
let serialized = JSON.stringify(classifier)
let date = Date.now()
fs.writeFileSync(`./${date}_RFModel`, serialized)
fs.writeFileSync(`./${date}_PCAModel`, PCASerialized)