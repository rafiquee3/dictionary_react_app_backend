const express = require('express');
const router = express.Router();
const dictionaryControllers = require('../controllers/dictionary');

/* 
GET /         LIST ALL WORDS FROM DICTIONARY
GET /:id      DISPLAY A WORD WITH THE GIVEN ID
POST /        CREATE A NEW WORD
DELETE /:id   DELETE A SPECIFIC WORD
PUT /:id      TO UPDATE A SPECIFIC WORD
 */

router.post('/', dictionaryControllers.listAllWords);
router.get('/:id', dictionaryControllers.findOneWord);
router.post('/add', dictionaryControllers.insertWordInToDb);
router.delete('/:user/:id', dictionaryControllers.deleteWordInToDb);
router.put('/:collection/:id/:word/:translation', dictionaryControllers.editWordInDb);
router.put('/:collection/:id', dictionaryControllers.increaseDifficultyLevel);
router.put('/dec/:collection/:id', dictionaryControllers.decreaseDifficultyLevel);
router.use((req, res) => res.status(404).end());

module.exports = router;
