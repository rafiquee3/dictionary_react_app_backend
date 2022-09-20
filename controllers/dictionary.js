const { getWords, insertWord, findOneAndDeleteTodo , findAndUpdateWord } = require('../db');
const { ObjectId } = require('mongodb');

const wordIsInValidFormat = (word, translation) => {
    let errors = [];

    if (word.length < 3) errors.push({ field: 'word', error: 'the entered word should contain at least 3 characters' });
    if (word.length > 15) errors.push({ field: 'word', error: 'the entered word should contain at max 15 characters' });
    if (translation.length < 3) errors.push({ field: 'translation', error: 'the entered translation should contain at least 3 characters' });
    if (translation.length > 15) errors.push({ field: 'translation', error: 'the entered translation should contain at max 15 characters' });
    if (!(/^[A-Za-z\s]*$/.test(word))) errors.push({ field: 'word', error: 'text must be letters' });
    if (!(/^[A-Za-z\s]*$/.test(translation))) errors.push({ field: 'translation', error: 'text must be letters' });
    
    return errors;
}

module.exports.listAllWords = async (req, res) => {
    try {
        const allWordsFromDb = await getWords();
        res.status(200);
        res.json(allWordsFromDb);//.json(allWordsFromDb);

    } catch (err) {
        res.status(500);
        res.json({
            message: err,
          });
    }
}
module.exports.insertWordInToDb = async (req, res) => {
    if (!req.body.word) { req.body.word = '' };
    if (!req.body.translation) { req.body.translation = '' };
    
    const { word, translation } = req.body;
    const validator = wordIsInValidFormat(word, translation);
    const allWordsFromDb = await getWords();

    try {
        if (validator[0]) {
            res.status(400);
            res.json({
                errors: validator,
            });
            return;
        } 

        // checking if a given record exists in the database
        const isWordExist = allWordsFromDb.filter(wordInDb => wordInDb.word === word);
        if (isWordExist[0]) {
            res.status(409);
            res.json({
                message: 'This word exist in data base',
            });
            return;
        }

        const wordToInsert = await insertWord(word.trim(), translation.trim());
        res.status(200)
        res.json(wordToInsert);
    } catch (err) {
        res.status(404);
        res.json({
            errors: err,
        });
    } 
}
module.exports.deleteWordInToDb = async (req, res) => {
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

        const wordToDelete = await findOneAndDeleteTodo(id);

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
    const { word, translation } = req.body;
    const allWordsFromDb = await getWords();
    let id = req.params.id;

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

        const wordToUpdate = await findAndUpdateWord(id, {$set: {word, translation}});
        
        res.status(200);
        res.json(wordToUpdate.value);

    } catch (err) {
        res.status(404);
        res.json({
            errors: err,
        });
    }
}