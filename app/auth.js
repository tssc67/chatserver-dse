const express = require('express');
const db = require('./db.js');
var authRouter = express.Router();
authRouter
.post('/create',(req,res)=>{
    var userID = req.body.userID.toString();
    var password = req.body.password.toString();
    db
});

module.exports = authRouter; 