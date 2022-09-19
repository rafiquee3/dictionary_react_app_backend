const { MongoClient } = require('mongodb');
const { db } = require('./config');
const url = 'mongodb://localhost:27017'//db;
let client = null;
const dbName = process.env.DBNAME || 'dictionary-words'; // env variables are located in nodemon.js 

const resetClient = () => {
    client = null;
}
const getClient = () => {
    if (client === null) {
        throw new Error('Not connected to the database');
    } else {
        return client;
    }
}

module.exports.connect = async () => {
    client = new MongoClient(url);
    await client.connect();
    console.log('connected to db');
}
module.exports.disconnect = async () => {
    const client = getClient(); 
    await client.close();
    resetClient();
    //console.log('Db disconnected');
}
module.exports.getDb = () => {
    const client = getClient();

    return client.db(dbName);
}
module.exports.drop = async () => {
    const client = getClient();
    const db = client.db(dbName);
    await db.dropDatabase();
};