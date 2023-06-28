const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method
userSchema.methods.passwordCheck = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
