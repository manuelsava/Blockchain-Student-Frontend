import React, { useState } from "react";
import { useContext, useEffect } from "react";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { ethers } from "ethers";
import { BlockchainContext } from "../Context/BlockchainContext";
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function MyBooks(props) {
    const { signerAddress, setSignerAddress, university } = useContext(BlockchainContext);
    const { libraryContract, bookContract } = useContext(BlockchainContext);
    const { client } = useContext(BlockchainContext);

    const [metadata, setMetadata] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {

        const getNFTs = async () => {
            props.setLoading(true);
            const NFTs = await Request.getBookNFTs(university);
            let metas = [];

            for (var index in NFTs) {
                const nft = NFTs[index];
                const balance = await bookContract.balanceOf(signerAddress, nft.BlockchainID);

                if (balance > 0) {
                    const fetchUrl = ToipfsGateway(nft.metadata);
                    const response = await fetch(fetchUrl);

                    let json = await response.json();
                    json['BlockchainID'] = nft.BlockchainID;
                    json['copies'] = balance;
                    json['supply'] = nft.supply;

                    metas.push(json);
                }
            }

            setMetadata(metas);
            props.setLoading(false);
        }

        if (libraryContract && bookContract) {
            getNFTs();
        }

    }, [libraryContract, bookContract, refresh])


    const handleReturn = async (id) => {
        Swal.fire({
            title: 'Approving BookNFT...',
            showConfirmButton: false,
        });
        const approve = await bookContract.setApprovalForAll(libraryContract.address, true).then((result) => {
            checkApproval(result.hash, id);
        });
    }

    const checkApproval = async(hash, id) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(bookContract.address, bookContract.interface, provider);
        evtContract.on("ApprovalForAll", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            startReturn(id);
            evtContract.removeAllListeners();
        })
    }

    const startReturn = async (id) => {
        Swal.fire({
            title: 'Returning BookNFT...',
            showConfirmButton: false,
        });
        const returnTx = await libraryContract.returnBook(id).then((result) => {
            checkReturn(result.hash);
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });
    }

    const checkReturn = async (hash) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(libraryContract.address, libraryContract.interface, provider);
        evtContract.on("Returned", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            evtContract.removeAllListeners();
            saveDB(event.args[0], event.args[1]);
        })
    }

    async function saveDB(args0, args1) {
        const status = await Request.uploadReturn(args0, args1) //bookId, student
        setRefresh(!refresh);
    }

    function ToipfsGateway(string) {
        return string.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    return (
        <div>
            <div className="pagetitle">
                <h1>Borrowed Books</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li className="breadcrumb-item active">Borrows</li>
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
                                            {"Pages: " + element.pages}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Authors: " + element.authors}
                                        </Card.Text>
                                        <Card.Text>
                                            {"Description: " + element.description}
                                        </Card.Text>
                                        <Button variant="primary" onClick={(e) => { e.preventDefault(); handleReturn(element.BlockchainID) }}>Return</Button>
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

export default MyBooks;