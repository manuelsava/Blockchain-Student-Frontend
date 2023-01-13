import React, { useState, useEffect, useContext } from "react";
import { createContext } from "react";
import { Store } from 'react-notifications-component';
import {io} from "socket.io-client";
import { BlockchainContext } from "../Context/BlockchainContext";

export const NotificationsContext = React.createContext({});

export const NotificationsProvider = (props) => {
    const {signerAddress, setEnrolled} = useContext(BlockchainContext);
    const [socketId, setSocketId] = useState();
    const [refreshBooks, setRefreshBooks] = useState(false);
    const [refreshProposals, setRefreshProposals] = useState(false);
    const [refreshExams, setRefreshExams] = useState(false);
    const [socket, setSocket] = useState(null);
    const [refreshDashboard, setRefreshDashboard] = useState(false);

    const api = process.env.REACT_APP_API;

    useEffect(() => {
        if(socket === null) {
            setSocket(io(api, {
                reconnectionDelay: 1000,
                reconnection: true,
                reconnectionAttemps: 10,
                agent: false,
                upgrade: false,
                rejectUnauthorized: false,
                autoConnect: false
            }));
        }

        if(signerAddress !== undefined && socket !== null){
            socket.open();

            socket.on("connect", () => {
                socket.emit("new-listener", signerAddress);
                setSocketId(socket.id);
                console.log("connected with id: " + socket.id);
            });    

            socket.on("book-expired", () => {
                Store.addNotification({
                    title: "Your book has expired!",
                    message: "please return it to library",
                    type: "warning",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshBooks(prevState => !prevState);
            })

            socket.on("student-approved", () => {
                Store.addNotification({
                    title: "Enrollment accepted!",
                    message: "You will soon receive your 100 STD and Id NFT",
                    type: "success",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setEnrolled(true);
                setRefreshDashboard(prevState => !prevState);
            })

            socket.on("vote-received", () => {
                Store.addNotification({
                    title: "Exam result",
                    message: "New exam result now available!",
                    type: "info",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshExams(prevState => !prevState);
            })

            socket.on("proposal-approved", () => {
                Store.addNotification({
                    title: "Your proposal has been approved!",
                    message: "It will be presented to university",
                    type: "success",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshProposals(!refreshProposals);
            })

            socket.on("proposal-negate", () => {
                Store.addNotification({
                    title: "Your proposal hasn't been approved!",
                    message: "It will not be presented to university",
                    type: "warning",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshProposals(prevState => !prevState);
            })

            socket.on("proposal-negateWithVeto", () => {
                Store.addNotification({
                    title: "Your proposal hans't been approved!",
                    message: "Your account will be blacklisted for a while",
                    type: "danger",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshProposals(prevState => !prevState);
            })

            socket.on("whitelisted", () => {
                Store.addNotification({
                    title: "Your account have been whitelisted",
                    message: "You can submit a new proposal",
                    type: "success",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setRefreshBooks(prevState => !prevState);
            })

            socket.on("update-proposals", () => {
                setRefreshProposals(prevState => !prevState);
            })


            socket.on("paymentReceived", () => {
                Store.addNotification({
                    title: "Payment received",
                    message: "You received an STD payment for your private lessons",
                    type: "success",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                });
                setEnrolled(true);
                setRefreshDashboard(prevState => !prevState);
            })
        }
    
    }, [signerAddress, socket])

    return (
        <NotificationsContext.Provider value={{
            socketId,
            refreshBooks,
            refreshProposals,
            refreshDashboard,
            setRefreshDashboard,
            refreshExams
            }}>
            {props.children}
        </NotificationsContext.Provider>
    )
}