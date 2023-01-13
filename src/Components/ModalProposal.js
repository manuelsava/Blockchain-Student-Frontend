import React, { useState, useContext, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { ethers } from "ethers";
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";
import { BlockchainContext } from "../Context/BlockchainContext";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function ModalProposal(props) {
    const {signerAddress, proposalsContract, stdContract, university} = useContext(BlockchainContext);

    const [title, setTitle] = useState();
    const [description, setDescription] = useState();

    const handleSubmitProposal = async () => {
        const stdBalance = await stdContract.balanceOf(signerAddress);
        if(ethers.utils.formatEther(stdBalance) <= 10) {
            Swal.fire(
                'Not enough STD',
                'You must possess at least 10 STD',
                'warning'
            );

            return;
        }

        Swal.fire({
            title: 'Approving 10 STD...',
            showConfirmButton: false,
        });

        const approve = await stdContract.approve(proposalsContract.address, ethers.utils.parseEther('10')).then((result) => {
            checkApproval(result.hash);
        });
    }

    const checkApproval = async (hash) => {
        console.log(hash);
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(stdContract.address, stdContract.interface, provider);
        evtContract.on("Approval", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            startUpdateProposal();
            evtContract.removeAllListeners();
        })
    }

    const startUpdateProposal = async() => {
        Swal.fire({
            title: 'Uploading proposal...',
            showConfirmButton: false,
        });
        const proposalTx = await proposalsContract.saveProposal(university, title).then((result) => {
            checkProposal(result.hash);
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
    }

    const checkProposal = async (hash) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(proposalsContract.address, proposalsContract.interface, provider);
        evtContract.on("newProposal", (...args) => {
            const event = args[args.length - 1];
            console.log(event);
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            saveDB(event.args[0], event.args[1], event.args[2]);
            evtContract.removeAllListeners();
        })
    } 

    async function saveDB(args0, args1, args2) {
        const status = await Request.CreateProposal(args0, args1, args2, description, university);
        if(status === 200){
            props.setActiveProposer(true);
            props.setRefresh(!props.refresh);
            props.closeModal();
        }
    }

    return (
        <Modal
            show={props.show}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    New Proposal
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="proposalTitle">
                        <Form.Label>Title </Form.Label>
                        <Form.Control type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="proposalText">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" as='textarea' placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={(e) => { e.preventDefault(); handleSubmitProposal()}}>
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.closeModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalProposal;