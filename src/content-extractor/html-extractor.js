import axios from 'axios';

class HTMlExtractor{
    /*
    A class that has one method which given a URL, returns an HTML string
    Is a class to support stateful methods
    */
    constructor(){

    }

    async get_url(url, credentials){ //returns promsie

    }
}

class GetExtractor extends HTMlExtractor{
    /*
    A very basic HTMLExtractor which simply makes a get request
    */

    async get_url(url, credentials){
        let response = await axios.get(url)
        return response.data
    }
}

export default GetExtractor;