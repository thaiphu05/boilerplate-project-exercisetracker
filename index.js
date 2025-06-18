const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const e = require('express')
// const mongoose = require('mongoose')
require('dotenv').config()

let Userlist = [];
let count = 0;

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/api/users', (req, res) => {
  console.log('Method: GET, Path: /api/users');
  let Userwith2attributes = [];
  for (let i = 0; i < Userlist.length; i++) {
    const user = Userlist[i];
    Userwith2attributes.push({
      _id: user._id,
      username: user.username
    });
  }
  res.json(Userwith2attributes);
});
 
app.post('/api/users', (req, res) => {
  const userInput = req.body.username;
  console.log('Method: POST, Path: /api/users');
  if (!userInput) {
    return res.status(400).json({ error: 'Username is required' });
  }

  count++;
  const newUser = {
    _id: count.toString(),
    username: userInput,
  };

  Userlist.push(newUser);

  res.json(newUser);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const ID = req.params._id;
  const { description, duration } = req.body;
  const rawDate = req.body.date;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const user = Userlist.find(user => user._id == ID);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const finalDate = rawDate ? new Date(rawDate).toDateString() : new Date().toDateString();

  const exercise = {
    description : description,
    duration: parseInt(duration),
    date: finalDate
  };

  user.log = user.log || [];
  user.log.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    ...exercise
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const ID = req.params._id;
  const user = Userlist.find(user => user._id == ID);
  const { from, to, limit } = req.query;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let logs = user.log || [];

  // Chuyển đổi và lọc theo "from" và "to"
  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    }))
  });
});

// app.get('/api/users/:_id/logs', (req, res) => {
//   const id = req.params._id;
//   const { from, to, limit } = req.query;
  
//   const user = Userlist.find(user => user._id === id);
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   let exercises = user.log || [];
  
//   // Apply date filters
//   if (from || to) {
//     exercises = exercises.filter(exercise => {
//       const exerciseDate = new Date(exercise.date);
//       return (!from || exerciseDate >= new Date(from)) && 
//              (!to || exerciseDate <= new Date(to));
//     });
//   }

//   // Apply limit
//   if (limit) {
//     exercises = exercises.slice(0, parseInt(limit));
//   }

//   return res.json({
//     _id: user._id,
//     username: user.username,
//     count: exercises.length,
//     log: exercises.map(({ description, duration, date }) => ({
//       description,
//       duration,
//       date
//     }))
//   });
// });
 

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
