const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortId = require("shortid");
const validUrl = require('valid-url');
const app = express();

// Basic Configuration
const port =  4347;

app.use(cors());

app.use(express.static('./public'))
app.use(express.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.get('/',(req,res)=>{
    res.json({"hello": "There"})
})



mongoose.connect('mongodb+srv://urlshortner:urlshortner@cluster0.x3rxrml.mongodb.net/Cluster0?retryWrites=true&w=majority',{useNewUrlParser: true,
  useUnifiedTopology: true,
 serverSelectionTimeoutMS: 5000
});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once("open",()=>{
console.log("database connection established successfully");
})


const Schema = mongoose.Schema;
const urlSchema = new Schema({
original_url: String,
short_url: String
})
const URL = mongoose.model("URL", urlSchema);




app.post("/api/shorturl", async function(req,res){
const url = req.body.url;
const urlCode = shortId.generate();

if(!validUrl.isWebUri(url)) {
res.status(200).json({
error: "invalid url"
})
} else {
try {
let findOne = await URL.findOne({
original_url:url
})
if(findOne){
res.json({
original_url: findOne.original_url,
short_url: findOne.short_url
})
} else {
findOne = new URL({
original_url: url,
short_url:  urlCode
})
await findOne.save()
res.json({
original_url: findOne.original_url,
short_url: findOne.short_url
})
}
} catch (err) {
res.json(500).json('server error');
}
}
})

app.get('/api/shorturl/:id?', async function(req,res){
try {
const urlParams = await URL.findOne({
short_url: req.params.id
})
if(urlParams) {
return res.redirect(urlParams.original_url)
} else {
return res.status(404).json({error:"invalid url"})
}
} catch(err){
res.status(500).json("error")
}
})













app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});