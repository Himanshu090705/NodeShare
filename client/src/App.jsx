import { Routes, Route } from "react-router-dom";
import Upload from "./views/Upload";
import Download from "./views/Download";
import Navbar from "./views/Navbar";
import Footer from "./views/Footer";
import Login from "./views/Login";
import Signup from "./views/Signup";
import Home from "./views/Home";
import Profile from "./views/Profile";
import EditProfile from "./views/Edit";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/file/:id" element={<Download />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit" element={<EditProfile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
