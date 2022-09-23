const { connect, drop, disconnect } = require('../client');
const bcrypt = require('bcryptjs');
const usersControler = require('./users');
const { getUser } = require('../db');

let req;
let res;

beforeEach(async () => {
    req = {
        params: {}
    };
    res = {
        json: jest.fn(),
        send: jest.fn(),
        status: jest.fn()
    };
});
beforeAll(connect);
beforeEach(drop);
afterEach(drop);
afterAll(disconnect);

const expectStatus = (status) => {
    if (status === 200) {
        return;
    }
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(status);
}
const expectResponse = (json) => {
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(json);
}

describe('list of all users', () => {
    it('works', async () => {
        const allUsers = await getUser();
        await usersControler.listAllUsers(req, res);

        expectStatus(200);
        expectResponse(allUsers);
    })
});
describe('adding a new user', () => {
    it('works', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };
 
        await usersControler.addUser(req, res);

        const allUsers = await getUser();
        const isExistUser = allUsers.find(user => user.login === login);
    
        const hash = isExistUser.password;
        const isThisSamePassword = bcrypt.compareSync(password, hash);
   
        expectStatus(200);
        expect(isThisSamePassword).toEqual(true);
        expectResponse(isExistUser);
    });
    it('handling errors when entering incorrect login', async () => {
        const login = 'incorrect login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);
        
        expectStatus(400);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('handling errors when entering incorrect login', async () => {
        const login = 'login';
        const password = 'incorrect password';
        req.body = { login, password };

        await usersControler.addUser(req, res);
        
        expectStatus(400);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
});
describe('find user', () => {
    it('works', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);

        const allUsers = await getUser();
        const isExistUser = allUsers.find(user => user.login === login);
 
        await usersControler.findUser(req, res);

        expectStatus(200);
        expect(res.json).toHaveBeenCalledWith(isExistUser);
    });
    it('handling errors when entering incorrect login', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);

        const allUsers = await getUser();
        const isExistUser = allUsers.find(user => user.login === login);
 
        req.body.login = "incorrect";
        await usersControler.findUser(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User name incorrect',
          });
    });
    it('handling errors when entering incorrect password', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);
 
        req.body.password = "incorrect";
        await usersControler.findUser(req, res);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login or password incorrect',
          })
    });
    it('handling errors when body in request is empty', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);
 
        req.body = {};
        await usersControler.findUser(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Missing body in request',
        });
    })
});
describe('edit user', () => {
    it('works', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);

        const allUsers = await getUser();
        const { length } = allUsers;
        const id = allUsers[length -1]._id;
  
        const hash = allUsers[length -1].password;
        req.params.id = id;
        
        await usersControler.editUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: id, login, password: hash });
    })
});
describe('delete user', () => {
    it('works', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);

        const allUsers = await getUser();
        const { length } = allUsers;
        const id = allUsers[length - 1]._id;
        const hash = allUsers[length - 1].password;
  
        const isThisSamePassword = bcrypt.compareSync(password, hash);
   
        req.params.id = id;

        await usersControler.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(isThisSamePassword).toEqual(true);
        expect(res.json).toHaveBeenCalledWith({ _id: id, login, password: hash });
    })
    it('handling errors when entering incorrect id', async () => {
        const login = 'login';
        const password = 'password';
        req.body = { login, password };

        await usersControler.addUser(req, res);

        req.params.id = 'incorrect';

        await usersControler.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id' });
    });
});