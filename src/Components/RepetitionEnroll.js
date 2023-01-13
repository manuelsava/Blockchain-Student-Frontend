import React from 'react';
import { useEffect, useState, useContext } from 'react';
import {  BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button';
import {ethers} from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BlockchainContext } from "../Context/BlockchainContext";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function RepetitionEnroll (props) {
    const [openModalRepetitions, setOpenModalRepetitions] = useState(false);

    const handleOpenModalRepetitions = () => {
        setOpenModalRepetitions(true);
    }

    const handleCloseModalRepetitions = () => {
        setOpenModalRepetitions(false);
    }
    
    return (
        null
    )

}

export default RepetitionEnroll;