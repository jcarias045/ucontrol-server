const express =  require('express');
const mongoose = require('mongoose');
const Company = require('../models/company.model.js');

const router = express.Router();

const createCompany = async (req, res) => {
    const  { Name,Logo,ShortName,Web,Active, AccessToCustomers,AccessToSuppliers,
        RequieredIncome, RequieredOutput,CompanyRecords,AverageCost} = req.body;

    const newCompany = new Company({  Name,Logo,ShortName,Web,Active, AccessToCustomers,AccessToSuppliers,
        RequieredIncome, RequieredOutput,CompanyRecords,AverageCost })

    try {
        await newCompany.save();

        res.status(201).json(newCompany );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

module.exports ={
    createCompany
}
