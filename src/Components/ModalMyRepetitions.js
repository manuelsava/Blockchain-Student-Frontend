import React, { useState, useContext, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import * as Request from '../Helpers/requestCreator';
import Dropdown from "react-bootstrap/Dropdown";
import Swal from "sweetalert2";
import { BlockchainContext } from "../Context/BlockchainContext";

function ModalMyRepetitions (props) {
    const {signerAddress, studentName} = useContext(BlockchainContext);

    const[rep, setRep] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const loadRep = async() => {
            const response = await Request.getMyRep(signerAddress);

            if(response.reps === null)
                return;

            const subjects = response.reps.subjects;
            var json = [];
            for(var index in subjects){
                json.push(subjects[index]);
            }
            setRep(json);
            console.log(rep);
        }

        if(signerAddress)
            loadRep().catch(console.error);
    }, [signerAddress, refresh])

    const handleDeleteSubject = async (id) => {
        const status = await Request.DeleteSubject(id, signerAddress);
        if(status === 200)
            setRefresh(!refresh);
    }

    const handleChangeStatus = async (id, active, name, price) => {
        const status = await Request.getStatusSubject(id, active, name, price, signerAddress);
        if(status === 200)
            setRefresh(!refresh);
    }
    
    const saveNewRep = async (subject, price) => {
        const status = await Request.UploadRep(subject, price, studentName, signerAddress);
        if(status === 200)
            setRefresh(!refresh);
    }

    const handleAddSubject = async () => {
        Swal.fire({
            title: 'Subject Form',
            html: `<input type="text" id="subject" class="swal2-input" placeholder="Enter subject">
            <input type="number" id="price" class="swal2-input" value="1" min="0" placeholder="Enter price">`,
            confirmButtonText: 'Add',

            preConfirm: () => {
              const subject = Swal.getPopup().querySelector('#subject').value
              const price = Swal.getPopup().querySelector('#price').value
              if (!subject || !price) {
                Swal.showValidationMessage(`Please fill all fields`)
              } else {
                  saveNewRep(subject, price);
              }
              return { subject: subject, price: price }
            }
        }).then((result) => {
            //null
        })
    }

    return (
        <Modal
        show={props.show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        tabIndex="-1"
        enforceFocus={false}
      >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
                Repetitions
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Price</th>
                        <th>Active</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rep.map((element) => {
                            return (
                                <tr key = {element._id}>
                                    <td>{element.name}</td>
                                    <td>{element.price}</td>
                                    <td>{element.active.toString()}</td>
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                Action
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={(e)=> {e.preventDefault(); handleChangeStatus(element._id, !element.active, element.name, element.price)} }>Change status</Dropdown.Item>
                                                <Dropdown.Item onClick={(e)=> {e.preventDefault(); handleDeleteSubject(element._id,)} }>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            )
                        })} 
                </tbody>
            </Table>
            <Button variant="primary" onClick={(e)=> {e.preventDefault(); handleAddSubject()} }>
                Add Subject
            </Button>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
} 

export default ModalMyRepetitions