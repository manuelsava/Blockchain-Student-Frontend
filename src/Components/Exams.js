import React, { useState } from "react";
import { useContext, useEffect } from "react";
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button';
import { BlockchainContext } from "../Context/BlockchainContext";
import { NotificationsContext } from "../Context/NotificationsContext";
import * as Request from "../Helpers/requestCreator";
import Swal from "sweetalert2";


function Exams(props) {
    const { signerAddress } = useContext(BlockchainContext);
    const { university } = useContext(BlockchainContext);
    const { refreshExams } = useContext(NotificationsContext);

    const [exams, setExams] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const loadExams = async () => {
            const exs = await Request.getExamsByUniversity(university);
            setExams(exs);
        }

        if (signerAddress && university) {
            loadExams();
        }
    }, [signerAddress, university, refresh, refreshExams])

    const handleExamEnrollment = async (id) => {
        Swal.fire({
            title: 'Enrolling...',
            showConfirmButton: false,
        })

        const status = await Request.ExamEnrollment(id, signerAddress);
        if (status === 200)
            setRefresh(!refresh);
    }


    const handleExamUnenroll = async (id) => {
        Swal.fire({
            title: 'Unenrolling...',
            showConfirmButton: false,
        })

        const status = await Request.ExamUnenrollment(id, signerAddress);
        if (status === 200)
            setRefresh(!refresh);
    }

    function isEnrolled(element) {
        const enr = element.enrollments;

        for (var index in enr) {
            console.log("ENR " + enr[index]);
            if (enr[index].student.localeCompare(signerAddress) == 0) {
                return true;
            }
        }

        return false;
    }

    function isPassed(element) {
        const verb = element.verbalizations;

        for (var index in verb) {
            const mark = parseInt(verb[index].mark);
            if (verb[index].student.localeCompare(signerAddress) === 0 && mark >= 18 && !verb[index].refused) {
                return true;
            }
        }

        return false;
    }

    return (
        <>
            <div className="pagetitle">
                <h1>Exams</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/">Home</a></li>
                        <li className="breadcrumb-item active">Exams</li>
                    </ol>
                </nav>
            </div>
            <div className="container">
                <div className="card">
                    <div className="card-body">
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>CFU</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((element) => {
                                    return (
                                        <tr key={element._id}>
                                            <td>{element._id}</td>
                                            <td>{element.name}</td>
                                            <td>{element.cfu}</td>
                                            <td>
                                                {isPassed(element) && <p>Verbalized</p>}
                                                {!isEnrolled(element) && !isPassed(element) && <Button variant="primary" onClick={(e) => { e.preventDefault(); handleExamEnrollment(element._id) }}>
                                                    Enroll
                                                </Button>}
                                                {isEnrolled(element) && !isPassed(element) && <Button variant="primary" onClick={(e) => { e.preventDefault(); handleExamUnenroll(element._id) }}>
                                                    Unenroll
                                                </Button>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Exams;