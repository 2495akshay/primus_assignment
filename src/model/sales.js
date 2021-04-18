const mongoose   = require("mongoose");
const { Schema } = mongoose;

const salesSchema = new Schema({
    userName : String,
    amount   : Number,
    date     : Date
})

module.exports = mongoose.model('sales', salesSchema);