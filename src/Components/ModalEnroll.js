import React, { useState, useContext, useEffect } from "react";
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import * as Request from '../Helpers/requestCreator';
import { BlockchainContext } from "../Context/BlockchainContext";

function ModalEnroll(props) {
  const [unis, setUnis] = useState([]);
  const [name, setName] = useState();
  const [surname, setSurname] = useState();
  const [university, setUniversity] = useState();

  const {signerAddress, setEnrolled} = useContext(BlockchainContext);

  useEffect(() => {
    const loadUnis = async () => {
      const uni = await Request.getUnis();
      setUnis(uni);
    }

    loadUnis().catch(console.error);
  }, [])

  const submitEnrollment = async (university, name, surname) => {
      const status = await Request.EnrollRequest(university, name, surname, signerAddress);
      if (status === 200){
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
          Enrollment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="enrollUni">
            <Form.Label>University </Form.Label>
            <Form.Select aria-label="" onChange={(e) => setUniversity(e.target.value)}>
              <option value="">Select University...</option>
              {unis.map((element) => {
                      return (
                        <option key={element._id} value={element.address}>{"(" + element.signature + ") " + element.name}</option>
                      )
              })} 
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="enrollName">
            <Form.Label>Name </Form.Label>
            <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="enrollSurname">
            <Form.Label>Surname </Form.Label>
            <Form.Control type="text" placeholder="Enter Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
          </Form.Group>

          <Button variant="primary" type="submit" onClick={(e) => { e.preventDefault(); submitEnrollment(university, name, surname) }}>
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

export default ModalEnroll;