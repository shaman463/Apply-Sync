import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// we are creating a schema for our login and signUp pages

const userSchema = new mongoose.Schema(
    {
        FirstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 4,
        },
        LastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 4,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // so that you don't return password by default
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {timestamps: true}
);

// Now we will hash our passwords for secure routing

// Before the document is saved the below function run userSchema.pre("save")
userSchema.pre("save", async function() {

    // the below ensure it will prevents re-hashing if you update another field like name, email, etc.
    // or if password is not modified skip the hashing
    if(!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// The below function checks if the password are matching or not

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;