import fs from 'fs'
import path from 'path'
import { idk } from './src/content-extractor/training_converter.js'

let directory = "./training_data"

let data_dir = path.join(directory, "HTML")
let label_dir = path.join(directory, "Corrected")
let final_dir = path.join(directory, "Custom")

fs.readdir(data_dir, (err, files) => {
    files.forEach(file => {
        if(file == ".DS_Store"){
            return
        }
        let corrected_filename = file + ".corrected.txt"
        
        let html_string = fs.readFileSync(path.join(data_dir, file), "utf8")
        let standard = fs.readFileSync(path.join(label_dir, corrected_filename), "utf8")

        let result_json = idk(html_string, standard)
        let result = JSON.stringify(result_json)
        fs.writeFileSync(path.join(final_dir, file + ".json"), result)
        console.log("" + file + " done")
    })
})
