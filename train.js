import fs, { readdirSync } from 'fs'
import path from 'path'

import ml_random_forest from 'ml-random-forest';
const { RandomForestClassifier } = ml_random_forest

import pca from 'ml-pca'
const { PCA } = pca

import matrix from 'ml-matrix'
const { Matrix } = matrix

const file_path = './training_data/Custom/'

let total_X = []
let total_y = []

let lmao = 0
for(let f of fs.readdirSync('./training_data/Custom/')){
    lmao += 1
    let pre_json = fs.readFileSync(path.join(file_path, f), "utf-8")
    let json = JSON.parse(pre_json)
    
    total_X.push(...(json.X.map(e => e)))
    total_y.push(...json.y)
    console.log("Finished loading " + f)
    if (lmao > 100){
        break
    }
}

let p = new PCA(total_X, { 'nCompNIPALS': 5, 'method': 'NIPALS'})
let new_X = p.predict(total_X)
console.log(new_X)

var options = {
    seed: 3,
    maxFeatures: 5,
    replacement: true,
    nEstimators: 10
  };

let classifier = new RandomForestClassifier(options)
console.log("Training...")
let previous_time = Date.now()
classifier.train(new_X, total_y)
let diff = Date.now() - previous_time
console.log("Finished training, took " + diff + " seconds")
let result = classifier.predict(new_X)

console.log("Testing training accuracy")
let correct = 0
let total = 0
for(let i = 0; i < result.length; i++){
    if(result[i] === total_y[i]){
        correct += 1
    }
    total += 1
}

console.log("Final Training Accuracy: " + (correct / total))

let serialized = JSON.stringify(classifier)
fs.writeFileSync('./model.json', serialized)