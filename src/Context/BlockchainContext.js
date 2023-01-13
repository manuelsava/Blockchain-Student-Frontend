import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { NFTStorage, File } from 'nft.storage';
import { ethers } from "ethers";
import * as Request from "../Helpers/requestCreator";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

export const BlockchainContext = React.createContext({});

export const BlockchainProvider = (props) => {
    const [initialized, setInitialized] = useState(false);

    const [signerAddress, setSignerAddress] = useState();
    const [uniContract, setUniContract] = useState();
    const [stdContract, setStdContract] = useState();
    const [idContract, setIdContract] = useState();
    const [libraryContract, setLibraryContract] = useState();
    const [enrollContract, setEnrollContract] = useState();
    const [bookContract, setBookContract] = useState();
    const [examsContract, setExamsContract] = useState();
    const [verbalizationsContract, setVerbalizationsContract] = useState();
    const [proposalsContract, setProposalsContract] = useState();
    const [degreeContract, setDegreeContract] = useState();
    const [enrolled, setEnrolled] = useState(false);
    const [NFTtoken, setNFTtoken] = useState(process.env.REACT_APP_NFT_STORAGE);

    //DB utils
    const[studentName, setStudentName] = useState();
    const[studentSurname, setStudentSurname] = useState();
    const[university, setUniversity] = useState();
    const[graduated, setGraduated] = useState(false);
    const[canGraduate, setCanGraduate] = useState(false);

    const client = new NFTStorage({token: NFTtoken});

    const api = process.env.REACT_APP_API;

    useEffect(() => {         
        const initContracts = async () => {
            const requestOptions = Request.getContractsOptions();

            const response = await fetch(api + "/getContracts", requestOptions)
            const data = await response.json();

            var contracts = data.Contracts;

            for(var index in contracts){
                const element = contracts[index];
                const contract = new ethers.Contract(element.contractAddress, element.jsonABI, signer);            
                
                switch(element.contractName){
                    case "UniToken":
                        setUniContract(contract);
                        break;
                    case "StudentToken":
                        setStdContract(contract);
                        break;
                    case "BookNFT":
                        setBookContract(contract);
                        break;
                    case "EnrollmentContract":
                        setEnrollContract(contract);
                        break;
                    case "IdNFT":
                        setIdContract(contract);
                        break;
                    case "Library":
                        setLibraryContract(contract);
                        break;
                    case "Exams":
                        setExamsContract(contract);
                        break;
                    case "Verbalizations":
                        setVerbalizationsContract(contract);
                        break;
                    case "Proposals":
                        setProposalsContract(contract);
                        break;
                    case "DegreeContract":
                        setDegreeContract(contract);
                        break;
                } 
            }

            setInitialized(true);
            console.log("contracts initialized");
        }

        const getSignerAddress = async () => {
            const signerAddr = await signer.getAddress();
            setSignerAddress(signerAddr);            
        }

        const checkEnrolled = async () => {
            const signerAddr = await signer.getAddress();
            const requestOptions = Request.getCheckEnrolledOptions(signerAddr);

            var response = await fetch(api + "/getStudentInfo", requestOptions);
            response = await response.json();
            const count = Object.keys(response.info).length;
            
            if(count > 0){
                setEnrolled(true);
                setStudentName(response.info[0].name);
                setStudentSurname(response.info[0].surname);
                setUniversity(response.info[0].university);
                setCanGraduate(response.info[0].canGraduate);
                setGraduated(response.info[0].graduated);
            }
        }


        if(props.login && !initialized){
            initContracts().catch(console.error);
            getSignerAddress().catch(console.error);
            checkEnrolled().catch(console.error); 
        }

        if(props.login && initialized){
            props.setLoading(false);
        }

    }, [props.login, initialized]);

    return (
        <BlockchainContext.Provider value={{
            signerAddress, setSignerAddress, 
            uniContract, setUniContract, 
            stdContract, setStdContract,
            bookContract, setBookContract,
            libraryContract, setLibraryContract,
            idContract, setIdContract,
            enrollContract, setEnrollContract,
            client,
            enrolled, setEnrolled,
            examsContract, setExamsContract,
            verbalizationsContract, setVerbalizationsContract,
            proposalsContract, setProposalsContract,
            degreeContract, setDegreeContract,
            university, setUniversity,
            studentName, studentSurname,
            graduated, setGraduated,
            canGraduate, setCanGraduate
            }}>
            {props.children}
        </BlockchainContext.Provider>
    )
}