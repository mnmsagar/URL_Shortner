const { MongoMemoryServer } = require('mongodb-memory-server');
const {getObjById, writeToFile} = require('../services/dataHelper');
const {connectToDb, getDb} = require('../connection');


describe('getObjById', () => {
  let mongoServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    connectToDb(uri,()=>{
      console.log("database")
    });
  });
  
  // afterAll(async () => {
  //   await getDb().close();
  //   await getDb().stop();
  // });

  it('should return the object with the given id', async () => {
    // Insert a test document into the database
    const testObj = {url: 'http://example.com'};
    const obj = await writeToFile(testObj);

    // Call the function with the test id
    const result = await getObjById(obj.urlCode);

    // Verify that the result matches the test object
    expect(result).toEqual(testObj);
  });

});
