import React from 'react'
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Tooltip } from '@chakra-ui/react';


const ScrollableChat = ({messages}) => {

    const {user} = ChatState();

  return (
    <ScrollableFeed>
        {messages && messages.map((currentMessage,indexOfCurrentMessage) => (
            <div style={{display: "flex"}} key={currentMessage._id}>
                {
                   (isSameSender(messages,currentMessage, indexOfCurrentMessage, user._id)) 
                                    ||
                   (isLastMessage(messages, indexOfCurrentMessage, user._id))
                                    &&
                    (
                    <Tooltip label = {currentMessage.sender.name} placement='bottom-start' hasArrow>
                        <Avatar
                            mt="7px"
                            mr={1}
                            size="sm"
                            cursor= "pointer"
                            name = {currentMessage.sender.name}
                            src = {currentMessage.sender.pic}
                        />
                    </Tooltip>
                    )
                }
                <span
                    style = {{
                        backgroundImage: `${currentMessage.sender._id === user._id
                            ? 'linear-gradient(to right, #a3f7bf, #66ff99)' // Sender gradient (light green)
                            : 'linear-gradient(to right, #a8d8ff, #69a1ff)'}`, // Receiver gradient (light blue)
                        borderRadius: '20px',
                        borderRadius: "20px",
                        padding: "5px 15px",
                        maxWidth: "75%",
                        marginLeft: isSameSenderMargin(messages, currentMessage, indexOfCurrentMessage, user._id),
                        marginTop: isSameUser(messages, currentMessage, indexOfCurrentMessage, user._id) ? 3 : 10,
                    }}
                >
                    {currentMessage.content}
                </span>
                

            </div>
        ))}
    </ScrollableFeed>
  )
}

export default ScrollableChat
