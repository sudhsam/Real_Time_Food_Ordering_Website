require('dotenv').config()
const express = require("express");
const app = express(); //express function call
const path = require("path"); //NODE path module
const ejs = require("ejs"); //This is template engine
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3300;
//mongoose
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')


//Database connection
const url = 'mongodb://localhost:27017/swadesh';
mongoose.connect(url, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: true,
  useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Database connected..')
})
// .catch(err => {
//   console.log('Connection failed..');
// });

// Session store
let mongoStore = new MongoDbStore({
  mongoUrl: url,
  collection: 'sessions'
})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//Session config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: mongoStore,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// express-flash 
app.use(flash())

///ASSETS
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

//set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views")); // set path
app.set("view engine", "ejs");

// home route
require('./routes/web')(app)

//common error
// app.use((req, res) => {
//   res.status(404).render('errors/404')
// })


const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
  // Join
  socket.on('join', (orderId) => {
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
  io.to('adminRoom').emit('orderPlaced', data)
})

