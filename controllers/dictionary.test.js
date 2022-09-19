const { connect, drop, disconnect } = require('../client');
const dictionaryControler = require('./dictionary');
const { getWords } = require('../db');

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
//beforeEach(drop);
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

describe('list all words from db', () => {
    it('works', async () => {
        await dictionaryControler.listAllWords(req, res);
        const allWordsFromDb = await getWords();
        
        expectStatus(200);
        expectResponse(allWordsFromDb)
    })
});

describe('adding a word to the database', () => {
    it.only('works', async () => {
        req.body = { word: "hello", translate: "world" };
        const allWordsFromDb = await getWords();
        await dictionaryControler.insertWordInToDb(req, res);

        expectStatus(200);
        expectResponse(allWordsFromDb)
    })
});