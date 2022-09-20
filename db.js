const { getDb } = require('./client.js');

const getCollection = (collectionName = 'dictionary') => {
    const db = getDb();
    return db.collection(collectionName);
};
module.exports.createCollection = async (collectionName) => {
    const db = getDb();
    db.createCollection(collectionName);
}
module.exports.getWords = async (search = {}) => {
    const collection = await getCollection();

    return await collection.find(search).toArray();
}
module.exports.insertWord = async (word, translation) => {
    const collection = await getCollection();
    const doc = { word, translation };
    const result = await collection.insertOne(doc);
    const _id = result.insertedId;

    return { _id, ...doc }
};
module.exports.findAndUpdateWord = async (id, modify) => {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
        {_id: id},
        modify, // parameters to modify
        {returnDocument: "after"}, // return updated doc
    );
    return result;
}
module.exports.findOneAndDeleteTodo = async (id) => {
    const collection = await getCollection();
    const result = collection.findOneAndDelete(
        {_id: id}
     );
    return result;
}
