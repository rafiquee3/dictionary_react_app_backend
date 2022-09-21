const { createCollection, getUser, insertUser } = require('../db');
const { ObjectId } = require('mongodb');

const userIsInValidFormat = (login, password) => {
    let errors = [];

    if (login.length < 3) errors.push({ field: 'login', error: 'the entered word should contain at least 3 characters' });
    if (login.length > 13) errors.push({ field: 'login', error: 'the entered word should contain at max 13 characters' });
    if (password.length < 3) errors.push({ field: 'password', error: 'the entered password should contain at least 3 characters' });
    if (password.length > 13) errors.push({ field: 'password', error: 'the entered password should contain at max 13 characters' });
    if (errors.length === 0) {
        if (!(/^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){3,13}[a-zA-Z0-9]$/.test(login))) errors.push({ field: 'login', error: 'text must be letters' });
        if (!(/^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){3,13}[a-zA-Z0-9]$/.test(password))) errors.push({ field: 'password', error: 'text must be letters' });
    }
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

        const newUser = await insertUser(login, password);
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

        if (!login || !password) {
            res.status(404);
            res.json({
                message: 'Missing body in request',
            });
        
            return;
        }
        if (user.length === 0) {
            res.status(404);
            res.json({
                message: 'User name incorrect',
            });
        
            return;
        }
    
        const isPasswordCorrect = user[0].password === password;
        if (!isPasswordCorrect) {
            res.status(401);
            res.json({
                message: 'Login or password incorrect',
            });
        
            return;
        }

        res.status(200);
        res.json(user[0]);

      } catch (err) {
        res.status(500).json({
            message: err,
        });
      }
}