const { getWords, insertWord } = require('../db');

const wordIsInValidFormat = (word, translate) => {
    let errors = [];

    if (word.length < 3) errors.push({ field: 'word', error: 'the entered word should contain at least 3 characters' });
    if (word.length > 15) errors.push({ field: 'word', error: 'the entered word should contain at max 15 characters' });
    if (translate.length < 3) errors.push({ field: 'translate', error: 'the entered translate should contain at least 3 characters' });
    if (translate.length > 15) errors.push({ field: 'translate', error: 'the entered translate should contain at max 15 characters' });
    if (!(/^[A-Za-z\s]*$/.test(word))) errors.push({ field: 'word', error: 'text must be letters' });
    if (!(/^[A-Za-z\s]*$/.test(translate))) errors.push({ field: 'translate', error: 'text must be letters' });
    
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
    const { word, translate} = req.body;
    const validator = wordIsInValidFormat(word, translate);
    const allWordsFromDb = await getWords();
    console.log(allWordsFromDb)
    console.log(word + translate)
    console.log(validator)
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
        const wordToInsert = await insertWord(word, translate);
        res.status(200)
        res.json(wordToInsert);
    } catch (err) {
        res.status(404)
    } 
    
}