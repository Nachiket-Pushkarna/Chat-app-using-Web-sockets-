const asyncHandler = require('express-async-handler');
const User = require('../data/models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(
    async (req, res) => {

        // 1st use case: Check if the user has entered all the required fields !!

        const { name, email, password, pic } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please enter all the fields")
        }

        // 2nd use case: Check if the user already exists in the database

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        // 3rd use case: Create the user 
        const user = await User.create({ name, email, password, pic });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.pic,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error("User not Found");
        }

    }
)

//For logging in the user

const authUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    //Find if the user exists in the database or not
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.pic,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password")
    }
})


// For searching the users using search BAR
// The request will be made to /api/user/?search=piyush
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ],
        }
        : {};

    const users = await User.find(keyword).find({_id: { $ne: req.user._id}});
    res.send(users);
})


module.exports = { registerUser, authUser, allUsers };    