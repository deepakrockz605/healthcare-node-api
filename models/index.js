const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var PatientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },  
  phone: {
    type: String,
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  prescribedMedication: {
    type: String,
    required: true,
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
  },
  pincode: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Patient", PatientSchema);
