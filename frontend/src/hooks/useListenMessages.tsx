import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation, { MessageType } from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: MessageType) => {
      const sound = new Audio(notificationSound);
      sound.play();

      if (selectedConversation && newMessage.senderId === selectedConversation.id) {
        const updatedMessages = [...messages, { ...newMessage, shouldShake: true }];
        setMessages(updatedMessages);
      } else {
        // Handle notifications for messages in other conversations
        console.log("New message in another conversation:", newMessage);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, messages, setMessages, selectedConversation]);
};

export default useListenMessages;