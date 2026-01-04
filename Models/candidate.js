const mongoose = require('mongoose'); 
//const bcrypt = require('bcrypt');

// Define the Candidate Schema
const candidateScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party:{
        type:String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    votes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required:true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
    
});

//create Candidate model
const Candidate= mongoose.model('Candidate',candidateScheme);
module.exports = Candidate;