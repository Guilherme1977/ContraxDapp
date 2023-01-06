import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import WalletProvider from "./context/WalletProvider";
import Exchange from "src/components/Exchange/Exchange";
import Farms from "src/pages/Farms/Farms";
import CreateToken from "src/pages/CreateToken/CreateToken";
import CreatePool from "src/pages/CreatePool/CreatePool";
import Dashboard from "src/components/Dashboard/Dashboard";
import AppProvider from "./context/AppProvider";

function App() {
    return (
        <WalletProvider>
            <AppProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />}>
                            <Route path="" element={<Dashboard />} />
                            <Route path="farms" element={<Farms />} />
                            <Route path="create-token" element={<CreateToken />} />
                            <Route path="create-pool" element={<CreatePool />} />
                            <Route path="exchange" element={<Exchange />} />
                        </Route>
                    </Routes>
                </Router>
            </AppProvider>
        </WalletProvider>
    );
}

export default App;
