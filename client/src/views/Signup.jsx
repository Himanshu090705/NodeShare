import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // If using React Router
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { SERVER_URL } from "../../../config";
const url = `${SERVER_URL}/api`;

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      try {
        const res = await axios.post(`${url}/signup`, formData);
        if (res.status === 409) {
          window.alert(res.data.message);
        } else if (res.status === 500) {
          window.alert(res.data.message);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.log("Error: " + error);
      }
    }
    setValidated(true);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-80 mt-5">
      <div className="col-10 col-md-6 col-lg-4 py-5 px-4 border border-5 rounded shadow-sm  mt-5">
        <center>
          <div className="login-logo">
            <i className="fa-solid fa-user-plus fa-3x"></i>
          </div>
          <h3 className="fw-bold mt-2">Sign Up to create account</h3>
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
          </p>
        </center>

        <form
          noValidate
          className={`needs-validation ${validated ? "was-validated" : ""}`}
          onSubmit={handleSubmit}
        >
          {/* Username Field */}
          <div className="form-floating mb-3 mt-4">
            <input
              type="text"
              name="fullName"
              className="form-control"
              id="floatingName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
            <label htmlFor="floatingName" className="form-label">
              <i className="fa-solid fa-user"></i>&nbsp;Full Name
            </label>
            <div className="invalid-feedback">Required!</div>
          </div>
          <div className="form-floating mb-3 mt-4">
            <input
              type="text"
              name="username"
              className="form-control"
              id="floatingUsername"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <label htmlFor="floatingUsername" className="form-label">
              <i className="fa-solid fa-user"></i>&nbsp;Username
            </label>
            <div className="invalid-feedback">
              Please provide a valid Username!
            </div>
          </div>

          {/* Email Field */}
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              id="floatingEmail"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="floatingEmail" className="form-label">
              <i className="fa-solid fa-envelope"></i>&nbsp;E-Mail
            </label>
            <div className="invalid-feedback">
              Please provide a valid Email!
            </div>
          </div>

          {/* Password Field */}
          <div className="form-floating mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              id="floatingPassword"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <label htmlFor="floatingPassword" className="form-label">
              <i className="fa-solid fa-lock"></i>&nbsp;Password
            </label>
            <div className="invalid-feedback">
              Please provide a valid Password!
            </div>
          </div>

          {/* Submit Button */}
          <button className="btn btn-light form-control mt-3">
            Create Account &nbsp;&nbsp;
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
