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

router.get('/', dictionaryControllers.listAllWords);
/* router.get('/:id', );
router.post('/', );
router.delete('/:id',);
router.put('/:id',); */
router.post('/', dictionaryControllers.insertWordInToDb);
router.use((request, response) => response.status(404).end());

module.exports = router;
