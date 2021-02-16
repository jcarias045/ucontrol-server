const express=require('express');
const AuthController = require('../controllers/auth');

const api= express.Router();

api.post("/refresh-access-token", AuthController.resfreshAccessToken);
api.post("/refresh-access-token-customer", AuthController.resfreshCustomerAccessToken);

module.exports=api;