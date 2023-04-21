const express = require("express");
const { port, app, hostname } = require("./app");

app.listen(port, () => {
  console.log(`Server is Running on PORT - ${port}`);
});
