import { ethers } from "ethers";
import React, { useState } from "react";
import {useContext, useEffect} from "react";
import {BlockchainContext} from "../Context/BlockchainContext";
import { NotificationsContext } from "../Context/NotificationsContext";
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Dropdown from "react-bootstrap/Dropdown";
import Card from 'react-bootstrap/Card'
import * as Request from '../Helpers/requestCreator';
import Swal from "sweetalert2";


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function LatestExams (props) {
    const [toggleTab, setToggleTab] = useState(1);
    const [history, setHistory] = useState([]);
    const [pending, setPending] = useState([]);
    const [carreer, setCarreer] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const {signerAddress, verbalizationsContract} = useContext(BlockchainContext);
    const {setCanGraduate, university, graduated} = useContext(BlockchainContext);
    const {refreshExams} = useContext(NotificationsContext);

    useEffect(() => {
        const getExams = async () => {
            console.log("get exams");
            const response = await Request.getExamsByStudent(signerAddress);
            
            var hist = [];  // Esami accettati 
            var pend = [];  // Esami da accettare
            var carr = [];  // Esami passati

            for(var index in response.verbalizations) {
                for(var i in response.verbalizations[index].verbalizations) {
                    if(response.verbalizations[index].verbalizations[i].student.localeCompare(signerAddress) !== 0)
                        continue;
                    var json = {};
                    json['BlockchainID'] = response.verbalizations[index].BlockchainID;
                    json['university'] = response.verbalizations[index].university;
                    json['_id'] = response.verbalizations[index]._id;
                    json['name'] = response.verbalizations[index].name;
                    json['cfu'] = response.verbalizations[index].cfu;
                    json['verbID'] = response.verbalizations[index].verbalizations[i]._id;
                    json['mark'] = response.verbalizations[index].verbalizations[i].mark;
                    json['accepted'] = response.verbalizations[index].verbalizations[i].accepted;
                    json['refused'] = response.verbalizations[index].verbalizations[i].refused;
                    if(json['accepted'] === false && json['refused'] === false){
                        pend.push(json);
                    } else {
                        hist.push(json);
                        if(parseInt(json['mark']) >= 18 && !json['refused']) {
                            carr.push(json);
                        }
                    }
                }
            }

            setCarreer(carr);
            setHistory(hist);
            setPending(pend);
        }


        if(signerAddress) {
            getExams().catch(console.error);
        }

    }, [signerAddress, refresh, refreshExams])

    const handleVerbalize = async(BlockchainID, university, mark, examID, verbID, cfu) => {
        Swal.fire({
            title: 'Uploading verbalization...',
            showConfirmButton: false,
        });
        const verbTx = await verbalizationsContract.verbalizeMark(university, BlockchainID, mark).then((result) => {
            checkVerbalization(result.hash, examID, verbID, cfu);
            console.log(result);
        }).catch((err) => {
            console.log(err);
        });

    }

    const checkVerbalization = async (hash, examID, verbID, cfu) => {
        const blockNumber = await provider.getBlockNumber();

        let evtContract = new ethers.Contract(verbalizationsContract.address, verbalizationsContract.interface, provider);
        evtContract.on("Verbalized", (...args) => {
            const event = args[args.length - 1];
            if(event.transactionHash.localeCompare(hash) !== 0) return; // do not react to this event
            saveDB(examID, verbID, cfu);
            evtContract.removeAllListeners();
        })
    }

    async function saveDB(examID, verbID, cfu) {
        const response = await Request.UploadVerbalization(examID, verbID, cfu, signerAddress, university); //student, exam, mark
        if(response.status === 200)
            setRefresh(!refresh);
        if(response.canGraduate)
            setCanGraduate(true);
    }

    const handleRefuse = async(examID, verbID) => {
        const status = await Request.RefuseVerbalization(examID, verbID); //student, exam, mark
        if(status === 200)
            setRefresh(!refresh);
    }

    return (
        <div style={{borderStyle: "ridge", overflowY:"auto"}}>
            <Tabs defaultActiveKey="carreer" id="uncontrolled-tab-example" className="mb-3" variant="pills" style={{maxHeight: "14rem", overflow: "visible"}}>
                <Tab eventKey="pending" title="Pending">
                    {pending.map((element) => {
                        return (
                            <div key={element.verbID} style={{marginBottom: "10px"}}>
                                <Card.Text style={{"marginBottom": 0}}>
                                    {"" + element.name + ": " + element.mark }
                                </Card.Text>
                                <Dropdown>
                                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                        Action
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={(e)=> {e.preventDefault(); handleVerbalize(element.BlockchainID, element.university, element.mark, element._id, element.verbID, element.cfu)}}>Accept</Dropdown.Item>
                                        <Dropdown.Item onClick={(e)=> {e.preventDefault(); handleRefuse(element._id, element.verbID) } }>Refuse</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        )
                    })} 
                </Tab>
                <Tab eventKey="carreer" title="Carreer">
                    {carreer.map((element) => {
                        return (
                            <Card.Text key={element.verbID} style={{marginBottom: "15px"}}>
                                {"" + element.name + ": " + element.mark}
                            </Card.Text>
                        )
                    })} 
                </Tab>
                <Tab eventKey="history" title="History"> 
                    {history.map((element) => {
                        return (
                            <Card.Text key={element.verbID} style={{marginBottom: "15px"}}>
                                {"" + element.name + ": " + element.mark}
                            </Card.Text>
                        )
                    })} 
                </Tab>
            </Tabs>
        </div>
    )
}

export default LatestExams;