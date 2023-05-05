const fileHelper = require('../services/fileHelper');

test("Promise Test",()=>{
    let arr = [];
    return expect(fileHelper.writeFileAsync(arr)).resolves.toBe("File written Successfully");
})