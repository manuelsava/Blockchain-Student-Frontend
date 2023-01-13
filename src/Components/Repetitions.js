import React from 'react';
import { useEffect, useState, useContext } from 'react';
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button';
import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";

import { BlockchainContext } from "../Context/BlockchainContext";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function Repetitions(props) {
    const { signerAddress, stdContract } = useContext(BlockchainContext);

    const [rep, setRep] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const loadRep = async () => {
            const response = await Request.getRepetitions();

            const student = response.reps;
            var json = [];
            var temp = {};
            for (var index in student) {
                if (student[index].student.localeCompare(signerAddress) === 0) {
                    continue;
                }
                for (var i in student[index].subjects) {
                    temp = {};
                    temp['student'] = student[index].name;
                    temp['address'] = student[index].student;
                    temp['studentID'] = student[index]._id;
                    temp['_id'] = student[index].subjects[i]._id;
                    temp['name'] = student[index].subjects[i].name;
                    temp['price'] = student[index].subjects[i].price;
                    json.push(temp);
                }
            }

            setRep(json);
        }

        if (signerAddress)
            loadRep().catch(console.error);
    }, [signerAddress, refresh])

    const handleAskRepetitions = async (address, price) => {
        var { value: range } = await Swal.fire({
            title: 'Insert Hours',
            icon: 'question',
            input: 'range',
            inputLabel: 'how many hours?',
            inputAttributes: {
                min: 0,
                max: 4,
                step: 1
            },
            inputValue: 1
        })

        if (range) {
            Swal.fire({
                title: 'Sending payment...',
                showConfirmButton: false,
            });
            price = parseInt(price);
            range = parseInt(range);

            const amountToPay = ethers.utils.parseEther((range * price).toString());
            const tx = await stdContract.payRepetition(address, amountToPay).then((result) => {
                checkRepetitions(result.hash);
                console.log(result);
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    const checkRepetitions = async (hash) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(stdContract.address, stdContract.interface, provider);
        evtContract.on("Paid", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            Swal.fire({
                icon: 'success',
                title: 'Repetitions paid successfully',
                showConfirmButton: false,
                timer: 1500
            })
            sendRepNotification(event.args[1], event.args[2]);
            evtContract.removeAllListeners();
        })
    }

    const sendRepNotification = async (to, amount) => {
        const status = Request.sendRepNotification(to, amount);
    }

    return (
        <>
            <div>
                <div className="pagetitle">
                    <h1>Repetitions</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                            <li className="breadcrumb-item active">Repetitions</li>
                        </ol>
                    </nav>
                </div>
                <div className="container">
                    <div className="row">
                        {rep.map((element) => {
                            return (
                                <div className="col-sm" key={element._id} style={{minWidth: "30%", maxWidth: "100%"}}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{element.name}</Card.Title>
                                            <Card.Text>
                                                {element.student + " " + element.price + "/h"}
                                            </Card.Text>
                                            <Button variant="success" onClick={(e) => { e.preventDefault(); handleAskRepetitions(element.address, element.price) }}>
                                                Ask
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}


export default Repetitions;