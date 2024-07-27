import { useEffect, useCallback } from "react";
import { useSocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";
import useNotifications, { Notification } from "../zustand/useNotification";
import notificationSound from "../assets/sounds/notification.mp3";
import useConversation from "../zustand/useConversation";
import { useNavigate } from "react-router-dom";

const useListenNotifications = () => {
    const { socket } = useSocketContext();
    const { addNotification } = useNotifications();
    const { selectedConversation, setSelectedConversation } = useConversation();
    const navigate = useNavigate();

    const handleNotificationClick = useCallback((notification: Notification) => {
        setSelectedConversation({
            id: notification.senderId,
            fullName: notification.senderFullName, 
            profilePic: notification.senderProfilePic
        });
        navigate("/");
    }, [setSelectedConversation, navigate]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (newNotification: Notification) => {
            console.log("New notification received:", newNotification);
           
            if (!selectedConversation || selectedConversation?.id !== newNotification.senderId) {
                addNotification(newNotification);
                const sound = new Audio(notificationSound);
                sound.play();
                toast.success(newNotification.message, {
                    onClick: () => handleNotificationClick(newNotification)
                });
            }
        };

        socket.on("newNotification", handleNotification);

        return () => {
            socket.off("newNotification", handleNotification);
        };
    }, [socket, addNotification, selectedConversation, handleNotificationClick]);
};

export default useListenNotifications;