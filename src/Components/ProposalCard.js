import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";
import { BlockchainContext } from "../Context/BlockchainContext";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function ProposalCard(props) {
    const {university, signerAddress} = useContext(BlockchainContext);
    const [responses, setResponses] = useState(['yes', 'no', 'no with veto']);
    const [vote, setVote] = useState("");
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const filterVote = () => {
            const voters = props.proposal.voters;
            if(voters === undefined)
                return;
            for(var i in voters) {
                if(signerAddress.localeCompare(voters[i].student) === 0) {
                    setVote(voters[i].vote);
                    break;
                }
            }
        }

        if(signerAddress)
            filterVote();
    }, [props.proposal, signerAddress])

    const handleSubmitVote = async (vote) => {
        if(!window.ethereum) {
            return;
        }

        const message = "Proposal: " + props.proposal.title + "\nVote: " + vote;
        const signature = await signer.signMessage(message);

        const status = await Request.uploadVote(props.proposal._id, props.proposal.BlockchainID, vote, signerAddress, message, signature, university);
        if(status === 200){
            props.setRefresh(!props.refresh);
        }
    }

    function renderButton(element){
        if("".localeCompare(vote) === 0) {
            return (
                <Button 
                variant="outline-dark" 
                size="sm" 
                key={props.proposal._id + element} 
                style={{"display": "flex", "flex": "0 0 100%", marginTop: "10px"}}
                onClick={(e) => { e.preventDefault(); handleSubmitVote(element)}}
                >{element}</Button>  
            )
        }
        else {
            return (
                <Button 
                variant={element.localeCompare(vote) == 0 ? "outline-success": "outline-dark"} 
                size="sm" 
                key={props.proposal._id + element} 
                style={{"display": "flex", "flex": "0 0 100%", marginTop: "10px"}}
                onClick={(e) => { e.preventDefault(); handleSubmitVote(element)}}
                disabled
                >{element}</Button>  
            )
        }
    }

    return (
        <Card className="proposalCard">
            <Card.Body>
                <Card.Title>{props.proposal.title}</Card.Title>
                <Card.Text>
                    {props.proposal.description}
                </Card.Text>
                <div style={{"display":"flex", "flexWrap": "wrap", justifyContent: "center", marginTop: "2%", marginBottom: "2%"}}>
                    {responses.map((element) => {
                        return (
                            renderButton(element)
                        );
                    })}
                </div>
            </Card.Body>
        </Card>
    );
}

export default ProposalCard;