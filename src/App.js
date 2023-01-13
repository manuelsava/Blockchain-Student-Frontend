import React from 'react';
import { useEffect, useState} from 'react';
import {  BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Loading from 'react-fullscreen-loading';
import MyNavbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import LibraryBooks from "./Components/LibraryBooks";
import MyBooks from "./Components/MyBooks";
import Exams from './Components/Exams';
import Repetitions from './Components/Repetitions';
import Proposals from './Components/Proposals';
import {ethers} from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ReactNotifications, Store } from 'react-notifications-component'
import "./App.css";
import 'react-notifications-component/dist/theme.css'
import { BlockchainContext, BlockchainProvider } from "./Context/BlockchainContext";
import { NotificationsContext, NotificationsProvider } from "./Context/NotificationsContext";

import "./Components/Fonts.css";

//<!-- Vendor CSS Files -->
import "./Components/assets/vendor/bootstrap/css/bootstrap.min.css" ;
import "./Components/assets/vendor/bootstrap-icons/bootstrap-icons.css" ;
import "./Components/assets/vendor/boxicons/css/boxicons.min.css" ;
import "./Components/assets/vendor/quill/quill.snow.css" ;
import "./Components/assets/vendor/quill/quill.bubble.css" ;
import "./Components/assets/vendor/remixicon/remixicon.css" ;
import "./Components/assets/vendor/simple-datatables/style.css" ;

//<!-- Template Main CSS File -->
import "./Components/assets/css/style.css" ;


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function App() {
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggleSidebar, setToggleSidebar] = useState(false);

  const connectWallet = async () => {
    await provider.send("eth_requestAccounts", []);
    const signerAddress = await signer.getAddress();
    setLogin(true);
  }

  useEffect(() => { //Wallet connection
    const initApp = async () => {
      try {
        const signerAddress = await signer.getAddress();
        console.log(signerAddress)
        setLogin(true);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  return (
    <BlockchainProvider login={login} setLoading={setLoading}>
      <NotificationsProvider>
        <Router>
          <div className={toggleSidebar ? "App toggle-sidebar" : "App"}>
            <Loading loading={loading} background="#8157ff" loaderColor="#fff" />
            <ReactNotifications />
            <MyNavbar login={login} toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar}></MyNavbar>
              <Sidebar></Sidebar>
              <main id="main" className="main">
              <Routes>
                <Route exact path="/" element={<Dashboard login={login} connectWallet={connectWallet} />} />
                <Route exact path="/exams" element={<Exams />} />
                <Route exact path="/my-books" element={<MyBooks setLoading={setLoading} />} />
                <Route exact path="/library-books" element={<LibraryBooks setLoading={setLoading} />} />
                <Route exact path="/repetitions" element={<Repetitions />} />
                <Route exact path="/proposals" element={<Proposals />} />
              </Routes>
            </main>
          </div>
        </Router>
      </NotificationsProvider>
    </BlockchainProvider>
  );
}

export default App;
