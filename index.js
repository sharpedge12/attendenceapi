const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const scrapers = require('./scrapers');

app.use(bodyParser.json())

app.use(function(req, res , next){
    res.header("Access-Control-Allow-Origin" , "*");
    res.header("Access-Control-Allow-Headers" , "Content-Type");
    next();
});

app.post('/attend', async(req, res) => {
    const {id , pass} = req.body;
    const result = await scrapers.getTables(id, pass);
    console.log(result)
    res.send(result)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})