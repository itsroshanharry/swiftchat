import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";
// import toast from "react-hot-toast"
import useNotifications, { Notification } from "../zustand/useNotification";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenNotifications = () => {
    const { socket } = useSocketContext();
    const { addNotification } = useNotifications();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (newNotification: Notification) => {
            console.log("New notification received:", newNotification);
            addNotification(newNotification);
            const sound = new Audio(notificationSound);
            sound.play();
            toast.success(newNotification.message); // Display success notification
        };

        socket.on("newNotification", handleNotification);

        return () => {
            socket.off("newNotification", handleNotification);
        };
    }, [socket, addNotification]);
};

export default useListenNotifications;
