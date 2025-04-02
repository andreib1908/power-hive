const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB =
  'mongodb+srv://badeaandrei1908:Gs7ompAYILqyFHSW@cluster0.g9aax.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('[DB] DB Connection succesful!');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[S] App running on port ${port}...`);
});

console.log(Date.now());
