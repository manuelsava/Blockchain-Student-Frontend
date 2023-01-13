import React, { useState } from "react";
import { useContext, useEffect } from "react";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { ethers } from "ethers";
import { BlockchainContext } from "../Context/BlockchainContext";
import { NotificationsContext } from "../Context/NotificationsContext";
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function LibraryBooks(props) {
    const { signerAddress, setSignerAddress, university } = useContext(BlockchainContext);
    const { libraryContract, bookContract, stdContract } = useContext(BlockchainContext);
    const { client } = useContext(BlockchainContext);
    const { refreshBooks } = useContext(NotificationsContext);

    const [metadata, setMetadata] = useState([]);
    const [borrowLock, setBorrowLock] = useState(false);

    useEffect(() => {
        const getNFTs = async () => {
            props.setLoading(true);
            console.log("loadd");
            const NFTs = await Request.getBookNFTs(university);
            let metas = [];

            for (var index in NFTs) {
                const nft = NFTs[index];
                const balance = await bookContract.balanceOf(libraryContract.address, nft.BlockchainID);

                if (balance > 0) {
                    const fetchUrl = ToipfsGateway(nft.metadata);
                    const response = await fetch(fetchUrl);

                    let json = await response.json();
                    json['BlockchainID'] = nft.BlockchainID;
                    json['copies'] = balance;
                    json['supply'] = nft.supply;

                    for (var i in nft.borrows) {
                        if (nft.borrows[i].student.localeCompare(signerAddress) === 0 && nft.borrows[i].isExpired === true) {
                            setBorrowLock(true);
                            json['expired'] = true;
                        }
                    }

                    metas.push(json);
                    props.setLoading(false);
                }
            }

            setMetadata(metas);
        }

        if (libraryContract && bookContract) {
            getNFTs();
        }

    }, [libraryContract, bookContract, refreshBooks])

    const handleBorrow = async (id) => {
        const stdBalance = await stdContract.balanceOf(signerAddress);
        if (ethers.utils.formatEther(stdBalance) <= 33) {
            Swal.fire(
                'Not enough STD',
                'You must possess at least 33 STD',
                'warning'
            );

            return;
        }

        Swal.fire({
            title: 'Approving 33 STD...',
            showConfirmButton: false,
        });

        const approve = await stdContract.approve(libraryContract.address, ethers.utils.parseEther('33')).then((result) => {
            checkApproval(result.hash, id);
        });
    }

    const checkApproval = async(hash, id) => {
        console.log(hash);
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(stdContract.address, stdContract.interface, provider);
        evtContract.on("Approval", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            startBorrow(id);
            evtContract.removeAllListeners();
        })
    }

    const startBorrow = async(id) => {
        Swal.fire({
            title: 'Borrowing Book...',
            showConfirmButton: false,
        });
        const borrowTx = await libraryContract.borrowBook(id).then((result) => {
            checkBorrow(result.hash);
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
    }

    const checkBorrow = async (hash) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(libraryContract.address, libraryContract.interface, provider);
        evtContract.on("Borrowed", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            saveDB(event.args[0], event.args[2]);
            evtContract.removeAllListeners();
        })
    }

    async function saveDB(args0, args2) {
        const status = await Request.uploadBorrow(args0, args2) //bookId, to
    }

    function ToipfsGateway(string) {
        return string.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    return (
        <div>
            <div className="pagetitle">
                <h1>Library</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li className="breadcrumb-item active">Library</li>
                    </ol>
                </nav>
            </div>
            <div className="container">
                <div className="row">
                    {metadata.map((element) => {
                        return (
                            <div className="col-sm" key={element.BlockchainID}>
                                <Card className="bookNFT">
                                    <Card.Img variant="top" src={ToipfsGateway(element.image)} />
                                    <Card.Body>
                                        <Card.Title>{element.name}</Card.Title>
                                        <Card.Text>
                                            {"ID: " + element.BlockchainID}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Copies: " + element.copies + "/" + element.supply}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Pages: " + element.pages}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Authors: " + element.authors}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Description: " + element.description}
                                        </Card.Text>
                                        {element.expired && <Card.Text>
                                            {"EXPIRED!"}
                                        </Card.Text>}
                                        {!borrowLock && <Button variant="primary" onClick={(e) => { e.preventDefault(); handleBorrow(element.BlockchainID) }}>Borrow</Button>}
                                        {borrowLock && <Button variant="danger" disabled onClick={(e) => { e.preventDefault(); handleBorrow(element.BlockchainID) }}>Borrow</Button>}
                                    </Card.Body>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default LibraryBooks;