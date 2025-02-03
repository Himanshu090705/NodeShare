import { Routes, Route } from "react-router-dom";
import Upload from "./views/Upload";
import Download from "./views/Download";
import Navbar from "./views/Navbar";
import Footer from "./views/Footer";
import Login from "./views/Login";
import Signup from "./views/Signup";

function App() {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<Upload />} />
                <Route path="/file/:id" element={<Download />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
            <Footer />
        </div>
    );
}

export default App;
