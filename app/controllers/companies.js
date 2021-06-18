const { find } = require("../models/company.model");
const Company = require("../models/company.model");
const fs = require("fs");
const path = require("path");

function getCompanies(req, res) {
  
    Company.find().then(company => {
      if (!company) {
        res.status(404).send({ message: "No existen compañias registradas" });
      } else {
        res.status(200).send({ company });
      }
    });
}

//obtener informacion de una compañia en especifico
function getInfoCompany(req, res) {

    const {id} = req.params;

    console.log(id);
    Company.find({ _id: id}).then(company => {
      if (!company) {
        res.status(404).send({ message: "La compañia no existe" });
      } else {
        res.status(200).send({ company });
      }
    });
  }

  
function createCompany (req, res){
    
    const company = new Company();
    console.log(req.body);
    const  { Name,Logo,ShortName,Web, AccessToCustomers,AccessToSuppliers,
    RequieredIncome, RequieredOutput,CompanyRecords,AverageCost,
    WorksOpenQuote, DaysQuotationValidity, DaysOrderValidity,
    AvailableReservation, OrderWithWallet, InvoiceLines, Nit, Ncr, ActividadPrimaria,
    ActividadSecundaria, ActividadTerciaria, Imprenta, Address,AccountingLevels} = req.body;

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
    company.WorksOpenQuote = WorksOpenQuote;
    company.DaysQuotationValidity = DaysQuotationValidity;
    company.DaysOrderValidity =  DaysOrderValidity;
    company.AvailableReservation = AvailableReservation;
    company.OrderWithWallet = OrderWithWallet;
    company.AverageCost = AverageCost;
    company.InvoiceLines = InvoiceLines;
    company.Nit = Nit;
    company.Ncr = Ncr;
    company.ActividadPrimaria= ActividadPrimaria;
    company.ActividadSecundaria= ActividadSecundaria;
    company.ActividadTerciaria= ActividadTerciaria;
    company.Imprenta= Imprenta;
    company.Address= Address;
    company.AccountingLevels=AccountingLevels;
    console.log(company);
    
    company.save((err, companyStored)=>{
        if(err){
            res.status(500).send({message: err});

        }else {
            if(!companyStored){
                res.status(500).send({message: "Error al crear compañia"});
                console.log(companyStored);
            }else{
                res.status(200).send({Company: companyStored})
            }
        }
    })
}

function deleteCompany(req, res) {
  console.log("probandoEliminar");
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
   console.log(companyData);
    Company.findByIdAndUpdate({_id: params.id}, companyData, (err, companyUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!companyUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({compania: "Compañia Actualizada"})
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
              res.status(404).send({ message: "Compañia no encontrada" });
          }
          else if (Active === false) {
              res.status(200).send({ message: "Compañia desactivada con exito" });
          }
      })
      
  } catch(error){
      res.status(500).json({
          message: "Error, compañia no desactivada",
          error: error.message
      });
  }
}


function uploadAvatar(req, res) {  //para cargar el logo de las compañias
  const params = req.params;
   console.log("id companuia", params.id);
  Company.findById({ _id: params.id }, (err, companyData) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!companyData) {
        res.status(404).send({ message: "Nose ha encontrado ningun usuario." });
      } else {
        let company = companyData;
        console.log(req.files);
        if ("archivo",req.files) {
          let filePath = req.files.avatar.path;
          let fileSplit = filePath.split("\\");
          let fileName = fileSplit[3];
          
          let extSplit = fileName.split(".");
          let fileExt = extSplit[1];
           console.log(fileExt);
          if (fileExt !== "png" && fileExt !== "jpg"  && fileExt !== "jpeg") {  //acá se valida la extensión de las imagenes a cargar
            console.log("aqui quedi");
            res.status(400).send({
              message:
                "La extension de la imagen no es valida. (Extensiones permitidas: .png y .jpg)"
            });
          } else {
            company.Logo = fileName;
            console.log("nombre", fileName);
            Company.findByIdAndUpdate(
              { _id: params.id },
              {Logo:fileName},
              (err, companyResult) => {
                if (err) {
                  console.log(err);
                  res.status(500).send({ message: "Error del servidor." });
                } else {
                  if (!companyResult) {
                    res
                      .status(404)
                      .send({ message: "No se ha encontrado ningun usuario." });
                  } else {
                    console.log("ingreso",fileName);
                    res.status(200).send({ avatarName: fileName });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = "./app/uploads/avatar/" + avatarName;
   console.log(filePath);
  fs.exists(filePath, exists => {
    if (!exists) {
      res.status(404).send({ message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
}

module.exports ={
    createCompany,
    getCompanies,
    deleteCompany,
    updateCompany,
    desactivateCompany,
    getInfoCompany,
    uploadAvatar,
    getAvatar
}

