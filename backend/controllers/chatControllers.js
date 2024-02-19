const asyncHandler = require('express-async-handler');
const Chat = require('../data/models/chatModel');
const User = require('../data/models/userModel');


//Controller for  Accessing or creating a one on one Chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserID param not sent with the request ");
    return res.sendStatus(400);
  }
  var isChat = await Chat.find({
    isGroupChat: false, 
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }


})

//Controller for Fetching the chats 

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email"
        });

        res.status(200).send(results)
      })
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})


//Controller for  Creating a group chat between 2 or more users
const createGroupChat = asyncHandler(async (req, res) => {

  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.lenght < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);  //Also push the user who created the group chat

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    })

    const fullGroupChat = await Chat.find({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    res.status(200).json(fullGroupChat);

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

});

// Controller for Renaming the Group chat
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(chatId, {
    chatName: chatName,
  }, {
    new: true,
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).json(updatedChat);
  }


})

// Controller for adding someone to the group chat

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(chatId, 
    {
    $addToSet: { users: userId },
    }, 
    {new: true}
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).json(added);
  }

})

// Controller for removing someone to the group chat

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(chatId, 
    {
    $pull: { users: userId },
    }, 
    {new: true}
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).json(removed);
  }

})



module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };