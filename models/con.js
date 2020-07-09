const mongoose = require("mongoose")

const conSchema = new mongoose.Schema({
     Title:String,

})

module.exports = mongoose.model("Con", conSchema)