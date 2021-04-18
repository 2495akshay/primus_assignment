// creating a sales schema to perform various database related operations
const mongoose   = require("mongoose");
const { Schema } = mongoose;

const salesSchema = new Schema({
    userName : String,
    amount   : Number,
    date     : Date
})
// exporting the file.
module.exports = mongoose.model('sales', salesSchema);