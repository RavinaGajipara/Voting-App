const express = require('express');
const router = express.Router();
const User = require('./../Models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//POST route to add a persons
router.post('/signup', async (req, res) => {
    try {
        const data = req.body //Assuming the request body contains the person data


        // 🔒 Enforce only ONE admin in database
        if (data.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });

            if (existingAdmin) {
                return res.status(409).json({
                    message: 'Admin already exists. Only one admin is allowed.'
                });
            }
        }
            //create a new User document using the Mongoose model
            const newUser = new User(data);

            //Save the new user to the database
            const response = await newUser.save();
            console.log('data saved');

            const payload = {
                id: response.id
            }

            console.log(JSON.stringify(payload));

            const token = generateToken(payload);
            console.log('token is:', token);

            res.status(200).json({ response: response, token: token });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

//Login Route
router.post('/login', async (req, res) => {
    try {
        //Extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        //Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        //If user does not exist or password does not match, send error
        const isPasswordMatch = await user.comparePassword(password);

        if (!user || !isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        //generate tokens
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        //return token as response
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json(user);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; //Extract the id from the token
        const { currentPassword, newPassword } = req.body;

        //Find the user by userId
        const user = await User.findById(userId);

        //If password does not match, send error
        const isPasswordMatch = await user.comparePassword(currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        //Update the password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'passsword updated' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
