//requiriendo a mongoose
const mongoose = require('mongoose');
//iniciando esquema
const Schema = mongoose.Schema;

/*creando esquema de base de datos para las coordenadas
 de los elementos a mostrar en las facturas*/

const CoordinatesInvoiceSchema = Schema({
    Company: {
        type: Schema.ObjectId,
        ref: "Company"
    },
    codInvoiceCoorX: Number,
    codInvoiceCoorY: Number,
    pageSize: String,
    dateCoorX: Number,
    dateCoorY: Number,
    nameCoorX: Number,
    nameCoorY: Number,
    addressCoorX: Number,
    addressCoorY: Number,
    cityCoorX: Number,
    cityCoorY: Number,
    nitCoorX: Number,
    nitCoorY: Number,
    payConditionCoorX: Number,
    payConditionCoorY: Number,
    quantityCoorX: Number,
    productsCoorX: Number,
    priceCoorX: Number,
    subtotalCoor: Number,
    totalCoorX: Number,
    totalCoorY: Number,
    totalCoorY2: Number,
    posY: Number,
    typeInvoice: String,
    sectorNameCoorX: Number,
    sectorNameCoorY: Number,
    ncrCoorX: Number,
    ncrCoorY: Number,
})

//exportando el esquema
module.exports = mongoose.model('CoordinateInvoice', CoordinatesInvoiceSchema);