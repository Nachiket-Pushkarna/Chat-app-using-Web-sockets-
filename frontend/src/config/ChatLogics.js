export const getSender = (loggedUser, users) => {
    return users?.[0]?._id === loggedUser?._id ? users?.[1]?.name : users?.[0]?.name;
}

export const getSenderFull = (loggedUser, users) => {
    return users?.[0]?._id === loggedUser?._id ? users?.[1] : users?.[0];
}

export const isSameSender = (messages, currentMessage, indexOfCurrentMessage, loggedInUserId) => {
    return (
        indexOfCurrentMessage < messages.length - 1
        &&
        (
            messages[indexOfCurrentMessage + 1].sender._id !== currentMessage._id
            ||
            messages[indexOfCurrentMessage + 1].sender._id === undefined
        ) &&
        messages[indexOfCurrentMessage].sender._id !== loggedInUserId
    );
};




export const isLastMessage = (messages, indexOfCurrentMessage, loggedInUserId) => {
    return (
        indexOfCurrentMessage === messages.length - 1 &&
        messages[messages.length - 1].sender._id !== loggedInUserId &&
        messages[messages.length - 1].sender._id
    )
};


export const isSameSenderMargin = (messages, currentMessage, indexOfCurrentMessage, loggedInUserId) => {
    if (
        indexOfCurrentMessage < messages.length - 1 &&
        messages[indexOfCurrentMessage + 1].sender._id !== currentMessage.sender._id &&
        messages[indexOfCurrentMessage].sender._id !== loggedInUserId
    ) {
        return 33;
    } else if (
        (indexOfCurrentMessage < messages.length - 1 &&
            messages[indexOfCurrentMessage + 1].sender._id !== currentMessage.sender._id &&
            messages[indexOfCurrentMessage].sender._id !== loggedInUserId) ||
        (indexOfCurrentMessage === messages.length - 1 && messages[indexOfCurrentMessage].sender._id !== loggedInUserId)
    ) {
        return 0;
    } else {
        return "auto";
    }
};


export const isSameUser = (messages, currentMessage, indexOfCurrentMessage) => {
    return indexOfCurrentMessage > 0 && messages[indexOfCurrentMessage -1].sender._id !== currentMessage.sender._id;
}