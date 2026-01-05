const express = require('express');
const router = express.Router();
const Candidate = require('./../Models/candidate');
const User = require('./../Models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return false;

        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

//POST route to add a Candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);

        if (!isAdmin) {
            return res.status(403).json({ message: 'user does not have admin role' });
        }

        const data = req.body //Assuming the request body contains the candidate data

        //create a new candidate document using the Mongoose model
        const newCandidate = new Candidate(data);

        //Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not admin role' });

        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true, // return the updated document
            runValidators: true //runs mongoose validation
        })

        if (!response) {
            return res.status(403).json({ error: 'Candidate not found' });
        }
        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not admin role' });

        const candidateId = req.params.candidateId;

        //assuming you have a Person Model
        const response = await Candidate.findByIdAndDelete(candidateId);
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data deleted');
        res.status(200).json({ message: 'Candidate deleted successfully' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Let's Start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    //no admin can vote
    //user can only vote once
    candidateId = req.params.candidateId;
    userId = req.user.id;
    try {

        //find candidate document with the specific candidateId
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        if (user.role == 'admin') {
            return res.status(400).json({ message: 'admin cannot vote' });
        }

        //Update the candidate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        //update the user record
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'vote recorded successsfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//vote count
router.get('/vote/count', async (req, res) => {
    try {
        //find all candidate and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: -1 });

        //Map candidate to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//candidate list
router.get('/list', async (req, res) => {
    try {
        //find all candidate and sort them by voteCount in descending order
        const candidate = await Candidate.find();

        //Map candidate to only return their name and voteCount
        const list = candidate.map((data) => {
            return {
                party: data.party,
                name:data.name
            }
        });

        return res.status(200).json(list);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
