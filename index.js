const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const routes = require('./routes/routes');
const bodyParser = require('body-parser');

app.set(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(bodyParser())
app.use(routes)

app.listen(9000, () => {
  console.log('app is running on localhost:9000')
})