var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
  // host: "192.168.0.135",
  host: "192.168.0.124",
  path: "%",
  user: "Colman",
  password: "shield123"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Shield in MySQL Connected!");
});

module.exports = con;
