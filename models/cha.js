const mongoose = require("mongoose")

const chaSchema = new mongoose.Schema({
     Title:String,
     BungBau: [{type:mongoose.Schema.Types.ObjectId}]
})

module.exports = mongoose.model("Cha", chaSchema)