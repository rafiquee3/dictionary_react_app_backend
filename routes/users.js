var express = require('express');
var router = express.Router();
const usersControllers = require('../controllers/users');

/* 
GET /         LIST OF ALL USERS
GET /:id      DISPLAY A WORD WITH THE GIVEN ID
POST /        CREATE A NEW WORD
DELETE /:id   DELETE A SPECIFIC WORD
PUT /:id      TO UPDATE A SPECIFIC WORD
 */

router.get('/', usersControllers.listAllUsers);
router.post('/find', usersControllers.findUser);
router.post('/add', usersControllers.addUser);
router.put('/:id', usersControllers.editUser);
router.delete('/:id', usersControllers.deleteUser);
router.use((req, res) => res.status(404).end());

module.exports = router;
