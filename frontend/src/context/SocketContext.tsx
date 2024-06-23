import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { createContext } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthContext } from "./AuthContext";

interface ISocketContext {
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export const useSocketContext = (): ISocketContext => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within a provider");
    }
    return context;
};

const socketURL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { isLoading, authUser } = useAuthContext();

    useEffect(() => {
        if (authUser && !isLoading) {
            const socket = io(socketURL, {
                query: {
                    userId: authUser?.id,
                },
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("Socket connected:", socket.id);
            });

            socket.on("connect_error", (err: any) => {
                console.error("Socket connection error:", err);
            });

            socket.on("disconnect", (reason: any) => {
                console.warn("Socket disconnected:", reason);
            });

            socket.on("getOnlineUsers", (users: string[]) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.close();
                socketRef.current = null;
            };
        } else if (!authUser && !isLoading) {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        }
    }, [authUser, isLoading]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContextProvider;
