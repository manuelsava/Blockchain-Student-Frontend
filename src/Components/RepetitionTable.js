import React from 'react';
import { useEffect, useState, useContext } from 'react';
import {  BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button';
import {ethers} from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import RepetitionEnroll from './RepetitionEnroll';
import { BlockchainContext } from "../Context/BlockchainContext";

function RepetitionTable (props) {
    const [filter, setFilter] = useState();

    return (
        null
    )
}

export default RepetitionTable;