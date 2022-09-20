var express = require('express');
var router = express.Router();
const dictionaryControllers = require('../controllers/dictionary');

/* 
GET /         LIST OF ALL USERS
GET /:id      DISPLAY A WORD WITH THE GIVEN ID
POST /        CREATE A NEW WORD
DELETE /:id   DELETE A SPECIFIC WORD
PUT /:id      TO UPDATE A SPECIFIC WORD
 */

/* router.get('/', dictionaryControllers.listAllWords);
router.get('/:id', dictionaryControllers.findOneWord);
router.post('/', dictionaryControllers.insertWordInToDb);
router.delete('/:id', dictionaryControllers.deleteWordInToDb);
router.put('/:id', dictionaryControllers.editWordInDb); */
router.use((req, res) => res.status(404).end());

module.exports = router;
