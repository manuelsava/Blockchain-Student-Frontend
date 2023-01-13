import { ethers } from "ethers";
import React, { useState } from "react";
import {useContext, useEffect} from "react";
import {BlockchainContext} from "../Context/BlockchainContext";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'

const NFTCard = (props) => {
    function ToipfsGateway(string){
        return string.replace("ipfs://", "https://ipfs.io/ipfs/"); 
    }

    function checkMark(mark) {
        if(mark) {
            return (
                <Card.Text>
                    {"Mark: " + mark}
                </Card.Text>    
            )
        }
    }

    return (
        <>
            {props.metadata.map((element) => {
                return (
                    <Card className="idCard" key={element.BlockchainID}>
                        <Card.Img variant="top" src={ToipfsGateway(element.image)} />
                        <Card.Body>
                            <Card.Title>{element.name + " " + element.surname}</Card.Title>
                            <Card.Text>
                                {"ID: " + element.BlockchainID}
                            </Card.Text>
                            <Card.Text>
                                {"University: " + element.university }
                            </Card.Text>
                            {checkMark(element.mark)}
                            <Card.Text>
                                {"Description: " + element.description}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                )
            })}
        </>
    )
}

export default NFTCard;