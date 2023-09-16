const mongoose = require("mongoose");

const Like = mongoose.model("Like", { count: Number, page: Number });

module.exports = Like;
