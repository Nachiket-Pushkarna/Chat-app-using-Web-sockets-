import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import "./styles.css";
import ScrollableChat from './ScrollableChat';
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "../animations/typing.json";

const ENDPOINT = "http://localhost:5000";
var socket , selectedChatBackup;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const[socketConnected, setsocketConnected] = useState(false);
    const[typing, setTyping] = useState(false);
    const[isTyping, setIsTyping] = useState(false);

    const options = {
        loop:true,
        autoplay: true,
        animationData: animationData,
    }

    


    const toast = useToast();

    useEffect(()=> {
        socket = io(ENDPOINT);
        socket.emit("setup",user);
        socket.on("connected", () => setsocketConnected(true));
        socket.on('typing',() =>  {setIsTyping(true)})
        socket.on('stop typing',() =>  {setIsTyping(false)})
        return ()=>{

        }
    });

    const sendMessage = async (e) => {
        if(e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const {data} = await axios.post('/api/message',{
                    content:newMessage,
                    chatId:selectedChat._id,
                },config);

                
                socket.emit("new message", data);
                setNewMessage("")
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                })
            }
        }
    };


    const fetchMessages = async() => {
        if(!selectedChat) return;

   

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);  //Hitting the endpoint
            console.log(messages);
            setMessages(data);
            setLoading(false);

            socket.emit('join chat', selectedChat._id);
        } catch(error){
            toast({
                title: "Error Occured!",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }
    };

    useEffect(() => {
        fetchMessages();

        selectedChatBackup = selectedChat;
        return () => {};
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if(!selectedChatBackup || selectedChatBackup._id !== newMessageRecieved.chat._id){
                if(!notification.includes(newMessageRecieved)){
                    setNotification([newMessageRecieved, ...notification]); 
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        })
    })
    console.log(notification,"--------------------------------");


    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing Indicator Logic
        if (!socketConnected) return;

        if(!typing){
            setTyping(true);
            socket.emit("typing",selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDifference = timeNow - lastTypingTime;

            if(timeDifference >= timerLength && typing){
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages = {fetchMessages}
                                />
                            </>
                        )}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="white"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ?
                            (

                                <Spinner
                                    size = "xl"
                                    w={20}
                                    h={20}
                                    alignSelf= "center"
                                    margin = "auto"
                                />

                            ) : (

                                <div className='messages'>
                                    <ScrollableChat messages = {messages} />
                                </div>
                                
                                )
                        }
                        <FormControl onKeyDown={sendMessage} isRequired mt = {3}>
                            {isTyping ? <div className='lottie'>
                                <Lottie  animationData={animationData} loop={true} />
                            </div>: <></>}
                            <Input
                                variant = "filled"
                                bg = "#E0E0E0"
                                placeholder='Enter a message..'
                                onChange = {typingHandler}
                                value = {newMessage}
                            />
                        </FormControl>
                    </Box>


                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </Box>
            )
            }

        </>
    )
}

export default SingleChat;
