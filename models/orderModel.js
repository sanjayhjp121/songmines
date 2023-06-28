const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  role: {
    type: String,
    enum: ["user", "sub-admin", "admin"],
    default: "user",
  },
  email: {
    type: String,
    required: [true, "Please enter a email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please enter a confirm password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match",
    },
  },
  //   passwordChangedAt: Date,
  //   passwordResetToken: String,
  //   passwordResetExpires: Date,
  //   active: {
  //     type: Boolean,
  //     default: true,
  //     select: false,
  //   },
});

module.exports = mongoose.model("Order", orderSchema);
