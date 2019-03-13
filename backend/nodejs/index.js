const express = require('express'),
     http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hostname = 'localhost';
const port = 3000;
const dboper = require('./operations');
const mongoose = require('mongoose');
const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promotionRouter = require('./routes/promotionRouter');
const userRouter = require('./routes/userRouter');


const app = express();
app.use(morgan('dev'));






//app.use('../../angular');



app.use(bodyParser.json());



app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promotionRouter);
app.use('/users', userRouter);

app.use((req, res, next) => {
  console.log(req.headers);
  res.statusCode = 404;
  fileUrl = req.url;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>Error 404: ' + fileUrl +
              ' not Found</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
