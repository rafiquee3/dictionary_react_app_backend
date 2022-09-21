const request = require('supertest');
const { connect, disconnect, drop } = require('./client')
const { application } = require('./app');
const app = application;

beforeAll(connect);
beforeEach(drop);
afterAll(disconnect);

describe('WORDS ENDPOINT', () => {
    it('list of all words available in the data base', async () => {
        const response = await request(app).get('/');

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('show one word from data base', async () => {
        const word = 'hello';
        const translation = 'world'
        const createResponse = await request(app).post('/').send({ word, translation });

        const createdWord = JSON.parse(createResponse.text);
        const id = createdWord._id;

        const response = await request(app).get(`/${id}`);

        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    });
    it('handle pages that are not found', async () => {
        const response = await request(app).get('/whatever');
        
        expect(response.status).toEqual(404);
    });
    it('creates a todo', async () => {
        const word = 'hello';
        const translation = 'world'
        const response = await request(app).post('/').send({ word, translation });
    
        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
        const createdWord = JSON.parse(response.text);
        expect(createdWord).toMatchObject({ word, translation });
    });
    it('returns an error when creating a word without a request body', async () => {
        const response = await request(app).post('/').send();
    
        expect(response.status).toEqual(400);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('updates a todo', async () => {
        const word = 'hello';
        const translation = 'world'
        const responseCreate = await request(app).post('/').send({ word, translation })
    
        expect(responseCreate.status).toEqual(200);
        expect(responseCreate.header['content-type']).toEqual('application/json; charset=utf-8')
        const createdWord = JSON.parse(responseCreate.text);
        expect(createdWord).toMatchObject({ word, translation });
    
        const id = createdWord._id;
        const nextWord = 'updated';
        const nextTranslation = 'value';
        const response = await request(app).put(`/${id}`).send({ word: nextWord, translation: nextTranslation });
    
        expect(response.status).toEqual(200);
        expect(response.header['content-type']).toEqual('application/json; charset=utf-8');
    
        const wordUpdate = JSON.parse(response.text);
        expect(wordUpdate).toMatchObject( { word: nextWord, translation: nextTranslation } );
    });
    it('delete a todo', async () => {
        const word = 'hello';
        const translation = 'world'
        const responseCreate = await request(app).post('/').send({ word, translation })
    
        expect(responseCreate.status).toEqual(200);
        expect(responseCreate.header['content-type']).toEqual('application/json; charset=utf-8');
        const createdWord = JSON.parse(responseCreate.text);
        expect(createdWord).toMatchObject({ word, translation });

        const id = createdWord._id;
        const response = await request(app).delete(`/${id}`).send();
        const deletedWord = JSON.parse(response.text);

        expect(response.status).toEqual(200);
        expect(deletedWord).toMatchObject({ word, translation });
    });
});
