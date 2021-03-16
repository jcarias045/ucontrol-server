const Company = require("../models/company.model");



function getCompanies(req, res) {
  
    Company.find().then(company => {
      if (!company) {
        res.status(404).send({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).send({ company });
      }
    });
  }
  



function createCompany (req, res){
    
    const company = new Company();

    const  { Name,Logo,ShortName,Web,Active, AccessToCustomers,AccessToSuppliers,
    RequieredIncome, RequieredOutput,CompanyRecords,AverageCost} = req.body;

    company.Name  =  Name;
    company.Logo = Logo;
    company.ShortName = ShortName;
    company.Web = Web;
    company.Active = Active;
    company.AccessToCustomers = AccessToCustomers;
    company.AccessToSuppliers = AccessToSuppliers;
    company.RequieredIncome = RequieredIncome;
    company.RequieredOutput = RequieredOutput;
    company.CompanyRecords = CompanyRecords;
    company.AverageCost = AverageCost;
    console.log(company);
    company.save((err, companyStored)=>{
        if(err){
            res.status(500).send({message: err});

        }else {
            if(!companyStored){
                res.status(500).send({message: "Error al crear el nuevo usuario."});
                console.log(companyStored);
            }else{
                res.status(200).send({Company: companyStored})
            }
        }
    })
}

module.exports ={
    createCompany,
    getCompanies
}





// const router = express.Router();

// const createCompany = async (req, res) => {
    
//     console.log( "HolaEndPoint" );
//      const  { Name,Logo,ShortName,Web,Active, AccessToCustomers,AccessToSuppliers,
//         RequieredIncome, RequieredOutput,CompanyRecords,AverageCost} = req.body;
        
//      const newCompany = new Company({Name,Logo,ShortName,Web,Active, AccessToCustomers,AccessToSuppliers,
//        RequieredIncome, RequieredOutput,CompanyRecords,AverageCost});
//        console.log(newCompany);

//     try {
//         await Company.save(newCompany);

//         res.status(201).json(newCompany);
//     } catch (error) {
//         res.status(409).json({ message: error.message });
//     }
// }

// module.exports ={
//     createCompany
// }
