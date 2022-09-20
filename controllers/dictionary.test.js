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
beforeEach(drop);
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
describe('show one word from db', () => {
    it('works', async () => {
        const word = "hello";
        const translation = "world";
        req.body = { word, translation};

        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const newWord = allWordsFromDb[allWordsFromDb.length - 1];
        req.params.id = newWord._id;

        await dictionaryControler.findOneWord(req, res);
        
        expectStatus(200);
        expect(res.json).toHaveBeenCalledWith(newWord);
    })
});
describe('adding a word to the database', () => {
    it('works', async () => {
        const word = "hello";
        const translation = "world";
        req.body = { word, translation};

        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const newWord = allWordsFromDb[allWordsFromDb.length - 1];

        expectStatus(200);
        expect(newWord).toMatchObject( {
            word,
            translation,
        });
    })
    it('handling errors when entering incorrect data', async () => {
        const word = "hel_lo";
        const translation = "wo1rld";
        req.body = { word, translation};

        await dictionaryControler.insertWordInToDb(req, res);

        expectStatus(400);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('handling errors when entering empty data', async () => {
        const word = "";
        const translation = "world";
        req.body = { word, translation};

        await dictionaryControler.insertWordInToDb(req, res);

        expectStatus(400);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
    it('trim function works', async () => {
        const word = "   hello";
        const translation = "world";
        req.body = { word, translation};

        await dictionaryControler.insertWordInToDb(req, res);

        expectStatus(200);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
});
describe('removing a word from the database', () => {
    it('works', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length -1];
        req.params.id = insertedWord._id;

        await dictionaryControler.deleteWordInToDb(req, res);

        expectStatus(200);
    });
    it('handling errors when id is invalid', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length -1];
        req.params.id = 'invalid id';

        await dictionaryControler.deleteWordInToDb(req, res);
        const { length } = await getWords();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid id'
        });
    });
    it('word does not exist in the database', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length -1];
        req.params.id = '1111aac644ea860dd1d57562';

        await dictionaryControler.deleteWordInToDb(req, res);
        const { length } = await getWords();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'the specified word does not exist in the database'
        });
    });
})
describe('editing a word in the database', () => {
    it('works', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length - 1];
        req.body = { word: 'new', translation: 'record'};
        req.params.id = insertedWord._id;

        await dictionaryControler.editWordInDb(req, res);
        const { length } = await getWords();

        expectStatus(200);
        expect(allWordsFromDb).toHaveLength(length);
    });
    it('handling errors when id is invalid', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length - 1];
        req.body = { word: 'new', translation: 'record'};
        req.params.id = 'invalid id';

        await dictionaryControler.editWordInDb(req, res);
        const { length } = await getWords();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid id'
        });
    });
    it('word does not exist in the database', async () => {

        const word = "hello";
        const translation = "world";
        req.body = { word, translation};
        
        await dictionaryControler.insertWordInToDb(req, res);

        const allWordsFromDb = await getWords();
        const insertedWord = allWordsFromDb[allWordsFromDb.length -1];
        req.params.id = '1111aac644ea860dd1d57562';

        await dictionaryControler.editWordInDb(req, res);
        const { length } = await getWords();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'the specified word does not exist in the database'
        });
    });
})