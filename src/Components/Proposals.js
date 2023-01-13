import React from 'react';
import { useEffect, useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { ethers } from "ethers";
import ModalProposal from './ModalProposal.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Request from '../Helpers/requestCreator';

import { BlockchainContext } from "../Context/BlockchainContext";
import { NotificationsContext } from "../Context/NotificationsContext";
import ProposalCard from './ProposalCard.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function Proposals(props) {
    const { signerAddress, university, proposalsContract } = useContext(BlockchainContext);
    const { refreshProposals } = useContext(NotificationsContext);

    const [openModalProposal, setOpenModalProposal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [isActiveProposer, setActiveProposer] = useState(false);
    const [isBlacklisted, setBlacklisted] = useState(false);

    useEffect(() => {
        const getActiveProposals = async () => {
            const response = await Request.getActiveProposals(university, signerAddress);

            if (response.proposals[0] === undefined)
                setProposals([]);

            setProposals(response.proposals.reverse());
        }

        const checkProposer = async () => {
            const result = await proposalsContract.isActiveProposer(signerAddress);
            console.log(result);
            setActiveProposer(result);

            console.log(result);

            const result2 = await proposalsContract.isBlacklisted(signerAddress);
            console.log(result2);
            setBlacklisted(result2);

            console.log(result2);
        }

        if (university !== undefined && proposalsContract !== undefined) {
            getActiveProposals();
            checkProposer();
        }
    }, [refresh, university, refreshProposals])

    function handleOpenModalProposal() {
        setOpenModalProposal(true);
    }

    function handleCloseModalProposal() {
        setOpenModalProposal(false);
    }

    return (
        <>
            <div>
                <div className="pagetitle">
                    <h1>Proposals</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                            <li className="breadcrumb-item active">Proposals</li>
                        </ol>
                    </nav>
                </div>
                {!isActiveProposer && !isBlacklisted && <Button variant="primary" onClick={(e) => { e.preventDefault(); handleOpenModalProposal() }}>New Proposal</Button>}
                {(isActiveProposer || isBlacklisted) && <Button variant="danger" disabled>New Proposal</Button>}
                <div className="container" style={{marginTop: "2%"}}>
                    <div className="row">
                        {proposals.map((element) => {
                            return (
                                <div className="col-sm" key={element.BlockchainID}>
                                    <ProposalCard proposal={element} key={element._id} refresh={refresh} setRefresh={setRefresh}></ProposalCard>
                                </div>
                            )
                        })}
                    </div>
                    <ModalProposal show={openModalProposal} closeModal={handleCloseModalProposal} refresh={refresh} setRefresh={setRefresh} setActiveProposer={setActiveProposer}></ModalProposal>
                </div>
            </div>
        </>
    )
}


export default Proposals;