const { MongoClient, ServerApiVersion } = require('mongodb');

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// defining the Express app
const app = express();


// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// const collection = client.db("Mood_App").collection("Users");

// let inputData = {"name":"Chris Kyle", "email":"123@urmom.com","password":"123456" }

const uri = "mongodb+srv://Admin:12345@cluster0.sne1o.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let inputData = {"name":"Chris Kyle", "email":"123@urmom.com","password":"123456" }
// defining an endpoint to return all ads
app.get('/', (req, res) => {
// collection.insertOne(inputData);

//function to add new data into new collections
addToDatabase("moods",inputData)
  res.send("Data Added");
});

app.post('/SignUp', function requestHandler(req, res) {
  console.log(JSON.stringify(req.body));
  addToDatabase("SignUpInfo",req.body)
  res.send(req.body);
});

app.get('/LogIn', function requestHandler(req, res) {
  console.log(JSON.stringify(req.body));
  res.send(req.body);
});


// starting the server
app.listen(8000, () => {
  console.log('listening on port 8000');
});

function addToDatabase(moodCollection,inputData){
    // let inputData = {"name":"Chris Kyle", "email":"123@urmom.com","password":"123456" }
    try{
      const collection = client.db("Mood_App").collection(moodCollection);
      collection.insertOne(inputData);
      console.log("Data Succesfully Added to Collection - \"" + collection + "\"");
    }
    catch(err){
      console.log("DB AddUserData Operation FAILED...");
      console.log(err);
    }
}