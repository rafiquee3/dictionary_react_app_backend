const { getWords, insertWord, findOneAndDeleteTodo , findAndUpdateWord } = require('../db');
const { ObjectId } = require('mongodb');

const wordIsInValidFormat = (word, translation) => {
    let errors = [];

    if (word.length < 3) errors.push({ field: 'word', error: 'the entered word should contain at least 3 characters' });
    if (word.length > 15) errors.push({ field: 'word', error: 'the entered word should contain at max 15 characters' });
    if (translation.length < 3) errors.push({ field: 'translation', error: 'the entered translation should contain at least 3 characters' });
    if (translation.length > 15) errors.push({ field: 'translation', error: 'the entered translation should contain at max 15 characters' });
    if (!(/^[A-Za-z'\s]*$/.test(word))) errors.push({ field: 'word', error: 'text must be letters' });
    if (!(/^[A-Za-z\s]*$/.test(translation))) errors.push({ field: 'translation', error: 'text must be letters' });
    
    return errors;
}

module.exports.listAllWords = async (req, res) => {

    const { collection } = req.body;

    try {
        const allWordsFromDb = await getWords( {}, collection);
        res.status(200);
        res.json(allWordsFromDb);//.json(allWordsFromDb);

    } catch (err) {
        res.status(500);
        res.json({
            message: err,
          });
    }
}

module.exports.findOneWord = async (req, res) => {
    let id = req.params.id;
    const allWordsFromDb = await getWords();

    try {
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        } 
        const isWordExist = allWordsFromDb.find(wordInDb => wordInDb._id.equals(id));

        if (!isWordExist) {
            res.status(404);
            res.json({
                message: 'the specified word does not exist in the database'
            });
            return;
        }

        const wordToShow = await getWords(id);

        res.status(200);
        res.json(wordToShow[0]);

    } catch (err) {

        res.status(404);
        res.json({
            errors: err,
        });
    }
};

module.exports.insertWordInToDb = async (req, res) => {
    if (!req.body.word) { req.body.word = '' };
    if (!req.body.translation) { req.body.translation = '' };
    if (!req.body.collection) { req.body.collection = '' };

    const { word, translation, collection } = req.body;
    const validatorErrors = wordIsInValidFormat(word, translation);
    const allWordsFromDb = await getWords({}, collection);

    try {
        if (validatorErrors.length > 0) {
            res.status(400);
            res.json({
                message: validatorErrors,
            });
            return;
        } 

        // checking if a given record exists in the database
        const isWordExist = allWordsFromDb.filter(wordInDb => wordInDb.word === word.trim());
        if (isWordExist[0]) {
            res.status(409);
            res.json({
                message: 'This word exist in data base',
            });
            return;
        }

        const wordToInsert = await insertWord(word.trim(), translation.trim(), collection);
        res.status(200)
        res.json(wordToInsert);
    } catch (err) {
        res.status(404);
        res.json({
            message: err,
        });
    } 
}

module.exports.deleteWordInToDb = async (req, res) => {
    let id = req.params.id;
    const user = req.params.user;
    console.log(user)
    const collectionName = user;
    const allWordsFromDb = await getWords({}, collectionName);
   
    try {
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        }
        
        const isWordExist = allWordsFromDb.find(wordInDb => wordInDb._id.equals(id));

        if (!isWordExist) {
            res.status(404);
            res.json({
                message: 'the specified word does not exist in the database'
            });
            return;
        }

        const wordToDelete = await findOneAndDeleteTodo(id, collectionName);

        res.status(200);
        res.json(wordToDelete.value);

    } catch (err) {

        res.status(404);
        res.json({
            errors: err,
        });
    }
}
module.exports.editWordInDb = async (req, res) => {
    const { word, translation, collection } = req.params;
    let id = req.params.id;
    const allWordsFromDb = await getWords({}, collection);
    const validatorErrors = wordIsInValidFormat(word, translation);

    try {
  
        const isThisSameName = allWordsFromDb
        .filter(wordInDb => wordInDb.word === word)
        .filter(wordInDb => !wordInDb._id.equals(ObjectId(id)));
       
        if (isThisSameName.length) {
            res.status(404);
            res.json({
                message: 'the specified word exist in the database'
            });
            return;
        }
     
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        }

        const isWordExist = allWordsFromDb
        .find(wordInDb => wordInDb._id.equals(id));

        if (!isWordExist) {
            res.status(404);
            res.json({
                message: 'the specified word does not exist in the database'
            });
            return;
        }

        if (validatorErrors.length > 0) {
            res.status(400);
            res.json({
                message: validatorErrors,
            });
            return;
        } 

        const wordToUpdate = await findAndUpdateWord(id, {$set: {word, translation}}, collection);
        
        res.status(200);
        res.json(wordToUpdate.value);

    } catch (err) {
        res.status(404);
        res.json({
            errors: err,
        });
    }
}

module.exports.increaseDifficultyLevel = async (req, res) => {
    const { collection } = req.params;
    let id = req.params.id;
    const allWordsFromDb = await getWords({}, collection);

    try {
     
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        }

        const isWordExist = allWordsFromDb
        .find(wordInDb => wordInDb._id.equals(id));

        if (!isWordExist) {
            res.status(404);
            res.json({
                message: 'the specified word does not exist in the database'
            });
            return;
        }

        const valueToUpdate = isWordExist.difficulty + 1;

        const wordToUpdate = await findAndUpdateWord(id, {$set: {difficulty: valueToUpdate}}, collection);
        
        res.status(200);
        res.json(wordToUpdate.value);

    } catch (err) {
        res.status(404);
        res.json({
            errors: err,
        });
    }
}

module.exports.decreaseDifficultyLevel = async (req, res) => {
    const { collection } = req.params;
    let id = req.params.id;
    const allWordsFromDb = await getWords({}, collection);

    try {
     
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        }

        const isWordExist = allWordsFromDb
        .find(wordInDb => wordInDb._id.equals(id));

        if (!isWordExist) {
            res.status(404);
            res.json({
                message: 'the specified word does not exist in the database'
            });
            return;
        }

        const valueToUpdate = isWordExist.difficulty <= 0 ? 0 : isWordExist.difficulty - 1;


        const wordToUpdate = await findAndUpdateWord(id, {$set: {difficulty: valueToUpdate}}, collection);
        
        res.status(200);
        res.json(wordToUpdate.value);

    } catch (err) {
        res.status(404);
        res.json({
            errors: err,
        });
    }
}