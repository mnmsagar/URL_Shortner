const { MongoMemoryServer } = require('mongodb-memory-server');
const {getObjById, writeToFile} = require('../services/dataHelper');
const {connectToDb, getDb} = require('../connection');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connectToDb(uri,()=>{
    console.log("Database Connected");
  });
});

// afterAll(async () => {
//   await getDb().close();
//   await getDb().stop();
// });

describe('getObjById', () => {

  it('should return the object with the given id', async () => {
    // Insert a test document into the database
    const testObj = {url: 'http://example.com'};
    const obj = await writeToFile(testObj);

    // Call the function with the test id
    const result = await getObjById(obj.urlCode);

    // Verify that the result matches the test object
    expect(result).toEqual(testObj);
  });

  // it('should return null if no object is found with the given id', async () => {
  //   // Call the function with a non-existent id
  //   const result = await getObjById('non-existent-id');

  //   // Verify that the result is null
  //   expect(result).toBeNull();
  // });
});
