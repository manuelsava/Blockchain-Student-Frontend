import Swal from "sweetalert2";
const api = process.env.REACT_APP_API;

export async function getBookNFTs(university) {
    const uni = {
        university: university
    };

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: uni   
        })
    };

    const response = await fetch(api + "/getBooks", requestOptions)
    const data = await response.json();

    return data.NFTs;
}

export function getContractsOptions() {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: {}   
        })
    };

    return requestOptions;
}

export async function getUnis() {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: {}   
        })
    };

    var response = await fetch(api + "/getUnis", requestOptions);
    response = await response.json();

    return response.Unis;
}

export async function EnrollRequest(university, name, surname, signerAddress) {
    Swal.fire({
        title: 'Sending request...',
        showConfirmButton: false,
    })

    const data = {
        university: university,
        name: name,
        surname: surname,
        wallet: signerAddress
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/enrollRequest", requestOptions);
    response = await response.json();

    if(response.status === 200){
        Swal.fire({
            icon: 'success',
            title: 'Request submitted successfully',
            showConfirmButton: false,
            timer: 1500
        })
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export function getCheckEnrolledOptions(address) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        student: {
                            type: "equal",
                            value: address
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    return requestOptions;
}

export async function getExamsByUniversity(address) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        university: {
                            type: "equal",
                            value: address
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    const response = await fetch(api + "/loadActiveExamsByUniversity", requestOptions);
    const json = await response.json();

    return json.exams;
}

export async function ExamEnrollment(id, signerAddress) {
    const data = {
        examId: id,
        student: signerAddress
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/enrollStudentExam", requestOptions);
    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Student enrolled!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Student not enrolled',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function ExamUnenrollment(id, signerAddress) {
    const data = {
        examId: id,
        student: signerAddress
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/unenrollStudentExam", requestOptions);
    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Student Unenrolled!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Unknown error',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}


export async function getIdNFT(address) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        student: {
                            type: "equal",
                            value: address
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    var response = await fetch(api + "/getStudentInfo", requestOptions);
    response = await response.json();

    return response.info[0];
}

export async function getMyRep(address) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        student: {
                            type: "equal",
                            value: address
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    var response = await fetch(api + "/getRepetitionsByStudent", requestOptions);
    response = await response.json();

    return response;
}

export async function UploadRep(subject, price, studentName, signerAddress) {
    const data = {
        student: signerAddress,
        name: studentName,
        subject: subject,
        price: price
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/addNewRepetition", requestOptions);
    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Subject uploaded!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Subject not uploaded!',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function DeleteSubject(id, signerAddress) {
    const data = {
        id: id,
        student: signerAddress
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/deleteSubjectById", requestOptions);
    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Subject Deleted!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Subject not deleted!',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function getStatusSubject(id, active, name, price, signerAddress) {
    const data = {
        id: id,
        name: name,
        price: price,
        student: signerAddress,
        active: active
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/changeSubjectStatusById", requestOptions);
    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Subject Updated!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Subject not updated!',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function getRepetitions() {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: {}   
        })
    };

    var response = await fetch(api + "/getRepetitions", requestOptions);
    response = await response.json();

    return response;
}

export async function getExamsByStudent(address) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        student: {
                            type: "equal",
                            value: address
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    var response = await fetch(api + "/getExamsByStudent", requestOptions);
    response = await response.json();

    return response;
}

export async function UploadVerbalization(examID, verbID, cfu, signerAddress, university) {
    const data = {
        examId: examID,
        verbID: verbID,
        cfu: cfu,
        student: signerAddress,
        university: university
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/uploadMark", requestOptions);
    response = await response.json();

    if(response.status === 200){
        Swal.fire({
            icon: 'success',
            title: 'Mark verbalized successfully!',
            showConfirmButton: false,
            timer: 1500
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Mark not verbalized',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response;
}

export async function RefuseVerbalization(examID, verbID) {
    const data = {
        examId: examID,
        verbID: verbID
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/refuseMark", requestOptions);
    response = await response.json();

    if(response.status === 200){
        Swal.fire({
            icon: 'success',
            title: 'Mark refused successfully!',
            showConfirmButton: false,
            timer: 1500
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Mark not refused',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function uploadBorrow(BlockchainID, student) {
    const data = {
        BlockchainID: BlockchainID.toString(),
        student: student,
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/uploadBorrow", requestOptions);
    response = await response.json();

    if(response.status === 200){
        Swal.fire(
            'Book borrowed',
            'You will soon receive it in your wallet',
            'success'
        );
    }
    else {
        Swal.fire(
            'Book not borrowed',
            'Unknown error',
            'error'
        );
    }

    return response.status;
}

export async function uploadReturn(BlockchainID, student) {
    const data = {
        BlockchainID: BlockchainID.toString(),
        student: student
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/uploadReturn", requestOptions);
    response = await response.json();

    if(response.status === 200){
        Swal.fire(
            'Book returned',
            '',
            'success'
        );
    }
    else {
        Swal.fire(
            'Book not returned',
            'Unknown error',
            'error'
        );
    }

    return response.status;
}

export async function CreateProposal (proposer, BlockchainID, savedTitle, description, university) {
    const data = {
        proposer: proposer,
        BlockchainID: BlockchainID.toString(),
        title: savedTitle,
        description: description,
        university: university
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    console.log("Request");

    var response = await fetch(api + "/uploadProposal", requestOptions);

    response = await response.json();

    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Proposal Created!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Proposal not Created',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function getActiveProposals(address, student) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        university: {
                            type: "equal",
                            value: address,
                            student: student
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    var response = await fetch(api + "/getActiveProposals", requestOptions);
    response = await response.json();

    return response;
}

export async function uploadVote(proposalID, BlockchainID, vote, signerAddress, message, signature, university) {
    const data = {
        proposalID: proposalID,
        BlockchainID: BlockchainID,
        vote: vote,
        student: signerAddress,
        message: message,
        signature: signature,
        university: university
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/updloadVote", requestOptions);
    response = await response.json();
    
    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Vote Uploaded!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Vote not Uploaded',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function getDegreeMark(student, university) {
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            navigation: {
                params: {
                    path: {
                        university: {
                            type: "equal",
                            value: university,
                            student: student
                        }
                    }
                }
            },
            pagination: {},
            payload: {}
        })
    };

    var response = await fetch(api + "/getDegreeMark", requestOptions);
    response = await response.json();

    console.log(response);

    return response.mark;
}

export async function uploadGraduation(university, studentAddress, tokenId, url) {
    const data = {
        student: studentAddress,
        university: university,
        tokenId: tokenId.toString(),
        url: url
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/uploadGraduation", requestOptions);
    response = await response.json();
    
    if(response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Graduated successfully!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Unknown error',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return response.status;
}

export async function sendRepNotification(to, amount) {
    const data = {
        to: to,
        amount: amount
    }

    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            navigation: {
                params: {}
            },
            pagination: {},
            payload: data   
        })
    };

    var response = await fetch(api + "/sendRepNotification", requestOptions);
    response = await response.json();

    return response.status;
}