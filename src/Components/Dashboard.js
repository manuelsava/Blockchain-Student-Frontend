import { ethers } from "ethers";
import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { BlockchainContext } from "../Context/BlockchainContext";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import ModalEnroll from "./ModalEnroll";
import LatestExams from "./LatestExams";
import * as Request from '../Helpers/requestCreator';
import ModalMyRepetitions from "./ModalMyRepetitions";
import { NotificationsContext } from "../Context/NotificationsContext";
import Swal from "sweetalert2";
import NFTCard from "./NFTcard";
const degreeImage = "../images/idNFT.png";
const imageLink = "https://bafkreigdlppdaurmohwj7e5fe6ozdo4rtezb3h7ct5ixegw22vb27x355m.ipfs.nftstorage.link/";

const provider = new ethers.providers.Web3Provider(window.ethereum);

function Dashboard(props) {
    const { stdContract, studentName, studentSurname } = useContext(BlockchainContext);
    const { signerAddress, university } = useContext(BlockchainContext);
    const { idContract, enrolled, client } = useContext(BlockchainContext);
    const { refreshDashboard, setRefreshDashboard } = useContext(NotificationsContext);
    const { graduated, setGraduated } = useContext(BlockchainContext);
    const { canGraduate, degreeContract } = useContext(BlockchainContext);

    const [balance, setBalance] = useState();
    const [showModalEnroll, setShowModalEnroll] = useState(false);
    const [showModalReps, setShowModalReps] = useState(false);
    const [metadata, setMetadata] = useState([]);

    useEffect(() => {
        const getBalance = async () => {
            if (stdContract && signerAddress) {
                const currentBalance = await stdContract.balanceOf(signerAddress);
                setBalance(ethers.utils.formatEther(currentBalance));
            }
        }

        const getIdNFT = async () => {
            let metas = [];
            const nft = await Request.getIdNFT(signerAddress);

            const fetchUrl = ToipfsGateway(nft.metadata);
            const resp = await fetch(fetchUrl);
            const json = await resp.json();
            json['BlockchainID'] = nft.BlockchainID;
            json['id'] = true;
            metas.push(json);
            setMetadata(metas);
        }

        const getDegreeNFT = async () => {
            let metas = [];
            var nft = await Request.getIdNFT(signerAddress);
            nft = nft.Degree[0];

            const fetchUrl = ToipfsGateway(nft.metadata);
            const resp = await fetch(fetchUrl);
            const json = await resp.json();
            json['BlockchainID'] = nft.DegreeID;
            json['id'] = false;
            metas.push(json);
            setMetadata(metas);
        }

        if (props.login && signerAddress && !graduated) {
            getBalance().catch(console.error);
            getIdNFT().catch(console.error);
        }

        if (props.login && signerAddress && graduated) {
            getDegreeNFT();
        }
    }, [signerAddress, stdContract, refreshDashboard, graduated]);

    const handleOpenModalEnroll = () => {
        setShowModalEnroll(true);
    }

    const handleCloseModalEnroll = () => {
        setShowModalEnroll(false);
    }

    const handleOpenModalReps = () => {
        setShowModalReps(true);
    }

    const handleCloseModalReps = () => {
        setShowModalReps(false);
    }

    const fetchImage = async () => {
        const response = await fetch(imageLink);
        const rBlob = await response.blob();
        return rBlob;
    }

    const handleGraduate = async () => {
        Swal.fire({
            title: 'Approving 33 STD...',
            showConfirmButton: false,
        });

        const approval = await stdContract.approve(degreeContract.address, ethers.utils.parseEther(balance)).then((result) => {
            checkApproval(result.hash);
        });
    }

    const checkApproval = async(hash) => {
        console.log(hash);
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(stdContract.address, stdContract.interface, provider);
        evtContract.on("Approval", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            startDegree();
            evtContract.removeAllListeners();
        })
    }

    const startDegree = async() => {
        Swal.fire({
            title: 'Generating Degree NFT...',
            showConfirmButton: false,
        });

        const mark = await Request.getDegreeMark(signerAddress, university);
        const image = await fetchImage();

        var metadataUpload = await client.store({
            name: studentName,
            surname: studentSurname,
            wallet: signerAddress,
            description: "Degree NFT",
            university: university,
            mark: mark,
            image: new File([image], studentName + "degree" + ".png", { type: 'image/png' }),
        });

        console.log(metadataUpload.url);

        const graduationTx = await degreeContract.graduateStudent(university, metadataUpload.url, parseInt(mark)).then((result) => {
            checkDegree(result.hash, metadataUpload.url);
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
    }

    const checkDegree = async (hash, url) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(degreeContract.address, degreeContract.interface, provider);
        evtContract.on("Graduated", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            saveDB(event.args[0], event.args[1], event.args[2], url);
            evtContract.removeAllListeners();
        })
    }

    async function saveDB(args0, args1, args2, url) {
        const status = await Request.uploadGraduation(args0, args1, args2, url);
        if (status === 200) {
            setGraduated(true);
            setRefreshDashboard(prevState => !prevState);
        }
    }

    function ToipfsGateway(string) {
        return string.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const renderDashboard = () => {
        if (enrolled && props.login) {
            return (
                <>
                    <section className="section dashboard">
                        <div className="row">

                            <div className="col-lg-8">
                                <div className="row">

                                    {!graduated && <><div className="col-xxl-4 col-md-6 customLarge">
                                        <div className="card info-card sales-card">

                                            <div className="card-body">
                                                <h5 className="card-title">{studentName} <span>| {studentSurname}</span></h5>

                                                <div className="d-flex align-items-center">
                                                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-book"></i>
                                                    </div>
                                                    <div className="ps-3">
                                                        <Button variant="primary" onClick={(e)=> {e.preventDefault(); handleOpenModalReps()} }>My Repetitions</Button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-xxl-4 col-md-6 customLarge">
                                        <div className="card info-card revenue-card">

                                            <div className="card-body">
                                                <h5 className="card-title">STD <span>| Balance</span></h5>

                                                <div className="d-flex align-items-center">
                                                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-currency-dollar"></i>
                                                    </div>
                                                    <div className="ps-3">
                                                        <h6>{balance}</h6>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div></>}
                                    <div className="col-xxl-4 col-xl-12" style={{minWidth: "100%"}}>

                                        <div className="card info-card customers-card">

                                            <div className="card-body">
                                                <h5 className="card-title">Exams <span>| History</span></h5>
                                                <LatestExams></LatestExams>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="col-xxl-4 col-md-6" style={{width: "fit-content"}}>
                                <NFTCard metadata={metadata} />
                            </div>
                        </div>
                    </section>
                </>
            )
        } else if (props.login && ! enrolled) {
            return (
                <>
                    <h3>Hello</h3>
                    <Button variant="primary" onClick={(e)=> {e.preventDefault(); handleOpenModalEnroll()}}>Enroll</Button>
                </>
            )
        } else if(!props.login) {
            return (
                <>
                    <h3>Please connect your wallet</h3>
                    <Button className="btn btn-dark btn-lg" onClick={(e) => { e.preventDefault(); props.connectWallet() }} >Connect with MetaMask 🦊</Button>
                </>
            )
        }
    }

    return (
        <>
            <div className="pagetitle">
                <h1>Dashboard</h1>
                {canGraduate && <Button variant="success" style={{marginTop: "20px"}} onClick={(e)=> {e.preventDefault(); handleGraduate()}}>Graduate!</Button>}
                {graduated && <h1 style={{marginTop: "10px"}}>🎉 Congratulations, {studentName}! 🎉</h1>}
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                </nav>
            </div>
            {renderDashboard()}
            <ModalEnroll show={showModalEnroll} closeModal={handleCloseModalEnroll}></ModalEnroll>
            <ModalMyRepetitions show={showModalReps} closeModal={handleCloseModalReps}></ModalMyRepetitions>
        </>
    )

    /*return (
        <div>
            <h2>Hello {studentName}</h2>
            {props.login && !graduated &&
                <h3>Your STD balance: {balance}</h3>
            }
            {props.login && graduated &&
                <h3>🎉 Congratulations! 🎉</h3>
            }
            {props.login && enrolled && canGraduate && <Button variant="success" onClick={(e)=> {e.preventDefault(); handleGraduate()} }>Graduate!</Button>}
            {props.login && enrolled && !graduated && <Button variant="primary" onClick={(e)=> {e.preventDefault(); handleOpenModalReps()} }>My Repetitions</Button>}
            {props.login && !enrolled && !graduated && <Button variant="primary" onClick={(e)=> {e.preventDefault(); handleOpenModalEnroll()}}>Enroll</Button>}
            
            {props.login && enrolled && <div style={{display:"flex", marginTop: "2%", justifyContent: "center", gap: "5%"}}>
                <NFTCard metadata={metadata} />
                <LatestExams />
            </div>}
            
            {!props.login && <h3>Please connect your wallet</h3>}
            <ModalEnroll show={showModalEnroll} closeModal={handleCloseModalEnroll}></ModalEnroll>
            <ModalMyRepetitions show={showModalReps} closeModal={handleCloseModalReps}></ModalMyRepetitions>
        </div>
    );*/
}

export default Dashboard;