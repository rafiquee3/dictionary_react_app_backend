const bcrypt = require("bcryptjs");
const { createCollection, findAndUpdateUser, findOneAndDeleteUser, getUser, insertUser } = require('../db');
const { ObjectId } = require('mongodb');

const userIsInValidFormat = (login, password) => {
    let errors = [];

    if (login.length < 5) errors.push({ field: 'login', error: 'the entered word should contain at least 5 characters' });
    if (login.length > 13) errors.push({ field: 'login', error: 'the entered word should contain at max 13 characters' });
    if (password.length < 5) errors.push({ field: 'password', error: 'the entered password should contain at least 5 characters' });
    if (password.length > 13) errors.push({ field: 'password', error: 'the entered password should contain at max 13 characters' });
    
    const reg = /^[a-zA-Z0-9]+[_]?[a-zA-Z0-9]+$/;
    if (!(reg.test(login))) errors.push({ field: 'login', error: 'login should consist of letters and numbers and may contain _' });
    if (!(reg.test(password))) errors.push({ field: 'password', error: 'password should consist of letters and numbers and may contain _' });
   
    return errors;
}

module.exports.listAllUsers = async (req, res) => {
    try {
        const allUsersFromDb = await getUser();
        res.status(200);
        res.json(allUsersFromDb);

    } catch (err) {
        res.status(500);
        res.json({
            message: err,
          });
    }
}
module.exports.addUser = async (req, res) => {
    try {
        if (!req.body.login || !req.body.password) {
            req.body = {
                login: '',
                password: ''
            }
        }
        const { login, password } = req.body;
        //createCollection('users');
        const user = await getUser({login});
        const validatorErrors = userIsInValidFormat(login, password);

        if (user.length > 0) {
          res.status(404);
          res.json({
            message: 'User with the given login already exists',
          });
      
          return;
        }
        if (validatorErrors.length > 0) {
            res.status(400);
            res.json({
                errors: validatorErrors,
            });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = await insertUser(login, hash);

        res.status(200);
        res.json(newUser);

      } catch (err) {
        res.status(500);
        res.json({
          message: err,
        });
      }
}
module.exports.findUser = async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await getUser({login});
        const { length } = user;

        if (!login || !password) {
            res.status(404);
            res.json({
                message: 'Missing body in request',
            });
        
            return;
        }
        if (length === 0) {
            res.status(404);
            res.json({
                message: 'User name incorrect',
            });
        
            return;
        }
        const hash = user[length - 1].password;
        const isPasswordCorrect = bcrypt.compareSync(password, hash);
       
        if (!isPasswordCorrect) {
            res.status(401);
            res.json({
                message: 'Login or password incorrect',
            });
        
            return;
        }

        res.status(200);
        res.json(user[length - 1]);

      } catch (err) {
        res.status(500).json({
            message: err,
        });
      }
}
module.exports.editUser = async (req, res) => {
    try {
        let id = req.params.id;
        const { login, password } = req.body;
        const validatorErrors = userIsInValidFormat(login, password);
     
        if (!req.body.login)  req.body.login = '';
        if (!req.body.password) req.body.password = '';

        if (validatorErrors.length > 0) {
            res.status(400);
            res.json({
                errors: validatorErrors,
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

        if (!login || !password) {
            res.status(404);
            res.json({
                message: 'Missing body in request',
            });
        
            return;
        }
 
        const user = await getUser({_id: id});

        if (user.length === 0) {
            res.status(404);
            res.json({
                message: 'User name incorrect',
            });
        
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
       
        const result = await findAndUpdateUser(id, {$set: {
            login: login,
            password: hash
        }});
       
        res.status(200);
        res.json(result.value);

    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
}
module.exports.deleteUser = async (req, res) => {
    try {
        let id = req.params.id;
        
        if (ObjectId.isValid(id)) {
            id = ObjectId(id);
        } else {
            res.status(404);
            res.json({
                message: 'Invalid id'
            });
            return;
        }

        const user = await getUser({_id: id});

        if (user.length === 0) {
            res.status(404);
            res.json({
                message: 'Invalid user',
            });
        
            return;
        }

        const result = await findOneAndDeleteUser(id);
 
        res.status(200);
        res.json(result.value);

    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
}