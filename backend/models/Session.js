const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  text: String,
  events: Array,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", SessionSchema);