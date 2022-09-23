const request = require('supertest');
const { connect, disconnect, drop } = require('./client')
const { application } = require('./app');
const app = application;

beforeAll(connect);
beforeEach(drop);
afterEach(drop);
afterAll(disconnect);

describe('WORDS ENDPOINT', () => {
    it('list of all words available in the data base', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('show one word from data base', async () => {
        const word = 'hello';
        const translation = 'world'
        const createResponse = await request(app).post('/words').send({ word, translation });

        const createdWord = JSON.parse(createResponse.text);
        const id = createdWord._id;

        const response = await request(app).get(`/words/${id}`);

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('handle pages that are not found', async () => {
        const response = await request(app).get('/whatever');
        
        expect(response.status).toEqual(404);
    });
    it('creating a word', async () => {
        const word = 'hello';
        const translation = 'world'
        const response = await request(app).post('/words').send({ word, translation });
    
        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
        const createdWord = JSON.parse(response.text);
        expect(createdWord).toMatchObject({ word, translation });
    });
    it('returns an error when creating a word without a request body', async () => {
        const response = await request(app).post('/words').send();
    
        expect(response.status).toEqual(400);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('word update', async () => {
        const word = 'hello';
        const translation = 'world'
        const responseCreate = await request(app).post('/words').send({ word, translation })
    
        expect(responseCreate.status).toEqual(200);
        expect(responseCreate.header['content-type']).toEqual('application/json; charset=utf-8')
        const createdWord = JSON.parse(responseCreate.text);
        expect(createdWord).toMatchObject({ word, translation });
    
        const id = createdWord._id;
        const nextWord = 'updated';
        const nextTranslation = 'value';
        const response = await request(app).put(`/words/${id}`).send({ word: nextWord, translation: nextTranslation });
    
        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8');
    
        const wordUpdate = JSON.parse(response.text);
        expect(wordUpdate).toMatchObject( { word: nextWord, translation: nextTranslation } );
    });
    it('word delete', async () => {
        const word = 'hello';
        const translation = 'world'
        const responseCreate = await request(app).post('/words').send({ word, translation })
    
        expect(responseCreate.status).toEqual(200);
        expect(responseCreate.header['content-type']).toEqual('application/json; charset=utf-8');
        const createdWord = JSON.parse(responseCreate.text);
        expect(createdWord).toMatchObject({ word, translation });

        const id = createdWord._id;
        const response = await request(app).delete(`/words/${id}`).send();
        const deletedWord = JSON.parse(response.text);

        expect(response.status).toEqual(200);
        expect(deletedWord).toMatchObject({ word, translation });
    });
});
describe('USERS ENDPOINT', () => {
    it('list of all users available in the data base', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('add user', async () => {
        const login = 'login';
        const password = 'password';

        const createdUser = await request(app).post('/users/add').send({ login: login, password: password });
        const response = await request(app).post('/users/find').send({ login: login, password: password });

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('find user', async () => {
        const login = 'login';
        const password = 'password';

        const createdUser = await request(app).post('/users/add').send({ login, password });
        const response = await request(app).post('/users/find').send({ login, password });
        const user = JSON.parse(response.text);

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('handle pages that are not found', async () => {
        const response = await request(app).get('/users/whatever');
        
        expect(response.status).toEqual(404);
    });
    it('returns an error when creating a user without a request body', async () => {
        const response = await request(app).post('/users/add').send();
    
        expect(response.status).toEqual(400);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('update user', async () => {
        const login = 'hello';
        const password = 'world'
        const responseCreate = await request(app).post('/users/add').send({ login, password })
        const createdUser = JSON.parse(responseCreate.text);

        const id = createdUser._id;
        const nextLogin = 'updated';
        const nextPassword = 'value';

        const response = await request(app).put(`/users/${id}`).send({ login: nextLogin, password: nextPassword });
        const userUpdate = JSON.parse(response.text);
        const hash = userUpdate.password;
   
        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8');
        expect(userUpdate).toMatchObject( { login: nextLogin, password: hash } );
    });
    it('delete user', async () => {
        const login = 'hello';
        const password = 'world';
        const responseCreate = await request(app).post('/users/add').send({ login, password });
    
        expect(responseCreate.status).toEqual(200);
        expect(responseCreate.header['content-type']).toEqual('application/json; charset=utf-8')

        const createdUser = JSON.parse(responseCreate.text);
        const id = createdUser._id;
        const hash = createdUser.password;

        const response = await request(app).delete(`/users/${id}`);
        const deletedUser = JSON.parse(response.text);

        expect(response.status).toEqual(200);
        expect(createdUser).toMatchObject({ login, password: hash });
        expect(deletedUser).toMatchObject({ login, password: hash });
    });
});
