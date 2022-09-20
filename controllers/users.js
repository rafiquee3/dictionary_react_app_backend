const { getUser, insertWord, findOneAndDeleteTodo , findAndUpdateWord } = require('../db');
const { ObjectId } = require('mongodb');

const userIsInValidFormat = (word, translation) => {
    let errors = [];

    if (word.length < 3) errors.push({ field: 'word', error: 'the entered word should contain at least 3 characters' });
    if (word.length > 15) errors.push({ field: 'word', error: 'the entered word should contain at max 15 characters' });
    if (translation.length < 3) errors.push({ field: 'translation', error: 'the entered translation should contain at least 3 characters' });
    if (translation.length > 15) errors.push({ field: 'translation', error: 'the entered translation should contain at max 15 characters' });
    if (!(/^[A-Za-z\s]*$/.test(word))) errors.push({ field: 'word', error: 'text must be letters' });
    if (!(/^[A-Za-z\s]*$/.test(translation))) errors.push({ field: 'translation', error: 'text must be letters' });
    
    return errors;
}

module.exports.findUser = async (req, res) => {

    try {
        const { login, password } = req.body;
    
        const user = getUser({login})[0] || null;
        if (!user) {
          res.status(404);
          res.json({
            message: 'User name incorrect',
          });
      
          return;
        }
    
        const isPasswordCorrect = user.password === password;
        if (!isPasswordCorrect) {
          res.status(401);
          res.json({
            message: 'Login or password incorrect',
          });
    
          return;
        }
    
        res.status(200);
        res.json({
          user,
        });
      } catch (err) {
        response.status(500).json({
          message: err,
        });
      }
}