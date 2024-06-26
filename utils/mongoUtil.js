const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose');

const dbURI = process.env.dbURI;
if (!dbURI) {
  throw new Error('Missing dbURI environment variable');
}

var _db;

module.exports = {
    connectToServer: function (callback) {
        mongoose.connect(dbURI)
            .then(() => {
                console.log('Connected to database');
                _db = mongoose.connection;
                return callback();
            })
            .catch(err => {
                console.error('Error connecting to the database. Exiting process', err);
                process.exit(1);
            });
    },
    getDb: function () {
        return _db;
    }
};