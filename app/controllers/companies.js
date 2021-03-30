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

    const  { Name,Logo,ShortName,Web, AccessToCustomers,AccessToSuppliers,
    RequieredIncome, RequieredOutput,CompanyRecords,AverageCost} = req.body;

    company.Name  =  Name;
    company.Logo = Logo;
    company.ShortName = ShortName;
    company.Web = Web;
    company.Active = true;
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

function deleteCompany(req, res) {
    const { id } = req.params;
  
    Company.findByIdAndRemove(id, (err, companyDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!companyDeleted) {
          res.status(404).send({ message: "Compañia no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "La compañia ha sido eliminado correctamente." });
        }
      }
    });
  }


function updateCompany(req, res){
    let companyData = req.body;
    const params = req.params;

    Company.findByIdAndUpdate({_id: params.id}, companyData, (err, companyUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!companyUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Compañia Actualizada"})
            }
        }
    })
}

async function desactivateCompany(req, res) {
   
  let companyId = req.params.id; 

  const {Active} = req.body;  //

  try{
      
      await Company.findByIdAndUpdate(companyId, {Active}, (CompanyStored) => {
          if (!CompanyStored) {
              res.status(404).send({ message: "No se ha encontrado la plaza." });
          }
          else if (Active === false) {
              res.status(200).send({ message: "Plaza desactivada correctamente." });
          }
      })
      
  } catch(error){
      res.status(500).json({
          message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
          error: error.message
      });
  }
}

module.exports ={
    createCompany,
    getCompanies,
    deleteCompany,
    updateCompany,
    desactivateCompany
}

