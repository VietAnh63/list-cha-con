var mongoose = require("mongoose")


var schemaMagic = new mongoose.Schema({
    name: String,
    image: String,
    level: Number
})

module.exports = mongoose.model("Magic", schemaMagic)