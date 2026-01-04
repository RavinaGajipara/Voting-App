const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');

// Define the User Schema
const userScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile: {
        type: String,
    },
    email:{
        type: String,
    },
    address:{
        type: String,
        required: true
    },
    aadharCardNumber:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        required:true,
        type:String
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    } 
});

userScheme.pre('save', async function(next){
    const person = this;

    //hash the password only if it has been modiified (oe is new)
    if(!person.isModified('password')) return ;
    try{
        //hash password genneration
        const salt = await bcrypt.genSalt(10);

        //hash password generation
        const hashedPassword = await bcrypt.hash(person.password, salt);

        //Override the plain password with the hashed one
       this.password = hashedPassword;

        
    }catch(err){
        throw err;
    }
})

userScheme.methods.comparePassword= async function(candidatePassword){
    try{
        // use bcrypt to compare the provided password with te hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

//create user model
const User = mongoose.model('User',userScheme);
module.exports = User;