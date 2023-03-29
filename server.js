const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const utils = require('./utlis');

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// defining the Express app
const app = express();
const port = process.env.PORT || 8000;

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enabling CORS for all requests
app.use(cors());

//Connection to the MongoDB server
const uri = "mongodb+srv://Admin:12345@cluster0.sne1o.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let inputData = {}

//function that adds the Users credentials to the Database
app.post('/SignUp', function requestHandler(req, res) {
  console.log(JSON.stringify(req.body));
  addToDatabase("Users", req.body)
  res.send(req.body);
});

//function that adds the users diary entry to the database
app.post('/FeelingsDesc', function requestHandler(req, res) {
  console.log(JSON.stringify(req.body));
  addToDatabase("DiaryEntry", req.body)
  res.send(req.body);
});

//function which retrieves diary entries from database
app.get('/MoodHistory', async function requestHandler(req, res) {
  const userId = req.query.UserId;
  const diaries = await getDiaryEntries(userId);
  res.send(diaries);
});

//function which retrieves mood entries from database
app.get('/MoodEntries', async function requestHandler(req, res) {
  const userId = req.query.UserId;
  const moods = await getMoodEntries(userId);
  console.log(moods);
  res.send(moods);
});

//function which submits the mood survey answers to the database
app.post('/UserQuestions', function requestHandler(req, res) {
  console.log(JSON.stringify(req.body));
  addToDatabase("MoodAns", req.body)
  res.send(req.body);
});

//validating user credendtials
app.post('/Login', async function (req, res) {
  const email = req.body.email;
  const pwd = req.body.password;

  // return 400 status if username/password is not exist
  if (!email || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password is required."
    });
  }
  const existingUser = await getUser(email);

  // return 401 status if the credential is not match.
  if (!existingUser) {
    return res.status(401).json({
      error: true,
      message: "No user found"
    });
  }

  // return 401 status if the credential is not match.
  if (email !== existingUser.Email || pwd !== existingUser.Password) {
    return res.status(401).json({
      error: true,
      message: "Email or Password is wrong."
    });
  }

  // generate token
  const token = utils.generateToken(existingUser);
  // get basic user details
  const userObj = utils.getCleanUser(existingUser);
  // return the token along with user details
  return res.json({ existingUser: userObj, token });

});

// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the userId does not match.
    if (user.email !== inputData.email) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(inputData);
    return res.json({ user: userObj, token });
  });
});

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

// request handlers
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js Tutorial! - ');
});

// starting the server
app.listen(port, () => {
  console.log('listening on port 8000');
});

//function used to add all informatoion to the database
function addToDatabase(moodCollection, inputData) {
  try {
    const collection = client.db("Mood_App").collection(moodCollection);
    collection.insertOne(inputData);
    console.log("Data Succesfully Added to Collection - \"" + collection + "\"");
  }
  catch (err) {
    console.log("DB AddUserData Operation FAILED...");
    console.log(err);
  }
}

//function which retrieves an exisiting user from the database matching by email
function getUser(email) {
  try {
    const collection = client.db("Mood_App").collection("Users");
    return collection.findOne({ Email: email });
  }
  catch (err) {
    console.log("DB Find user FAILED...");
    console.log(err);
  }
}

//function which retrieves all diary entries recorded by a user matching by userId
function getDiaryEntries(userid) {
  try {
    console.log(`Getting diary entry for user with user id: ${userid}`);
    const collection = client.db("Mood_App").collection("DiaryEntry");
    return collection.find({ UserId: userid }).toArray();
  }
  catch (err) {
    console.log("DB Find user FAILED...");
    console.log(err);
  }

}

//function which retrieves all mood entries recorded by a user matching by userId
function getMoodEntries(userid) {
  try {
    console.log(`Getting mood entry for user with user id: ${userid}`);
    const collection = client.db("Mood_App").collection("MoodAns");
    return collection.find({ UserId: userid }).toArray();
  }
  catch (err) {
    console.log("DB Find user FAILED...");
    console.log(err);
  }
}