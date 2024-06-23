import create from 'zustand';

export interface Notification {
    id: string;
    message: string;
    createdAt: string;
    receiverId: string;
}

interface NotificationsState {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
}

const useNotifications = create<NotificationsState>((set) => ({
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification],
    })),
}));

export default useNotifications;
