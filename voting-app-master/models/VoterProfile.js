const mongoose = require("mongoose");

const VoterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: Date, required: true },
  voterId: { type: String, unique: true },
  faceData: { type: String }, // base64 or file reference
  idDocument: { type: String }, // file reference
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VoterProfile", VoterProfileSchema);
