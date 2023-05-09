const fileHelper = require("../services/fileHelper");
const fs = require('fs');

test("Promise Test", () => {
	let arr = [];
	return expect(fileHelper.writeFileAsync(arr)).resolves.toBe("File written Successfully");
});
