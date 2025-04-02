import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // If using React Router
import "bootstrap/dist/css/bootstrap.min.css";
<<<<<<< HEAD
import { SERVER_URL } from "../../../config";
import axios from "axios";
import useUserStore from "../store/userStore";
const url = `${SERVER_URL}/api`;

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [validated, setValidated] = useState(false);

  const setIsLogin = useUserStore((state) => state.setIsLogin);
  const isLogin = useUserStore((state) => state.isLogin);
  const navigate = useNavigate();
=======
import { supabase } from "../../../server/db/connect";
import useUserStore from "../store/userStore";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const setAuthSession = useUserStore((state) => state.setAuthSession);
  const session = useUserStore((state) => state.session);
  const navigate = useNavigate();

>>>>>>> 28e6fdf48fdfdb7390e0687af8e65b096a5830eb
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      console.log("Submitting form data:", formData);
      try {
        const res = await axios.post(`${url}/login`, formData);
        if (res.status === 200) {
          setIsLogin(true);
          navigate('/upload');
        }
      } catch (error) {
        console.log(error);
      }
    }
    setValidated(true);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-80 mt-5">
      <div className="col-10 col-md-6 col-lg-4 py-5 px-4 border border-5 rounded shadow-sm  mt-5">
        {/* <div className="row mt-3 px-2"> */}
        {/* <div className="col-3 m-auto py-5 border border-5 rounded shadow-sm overflow-hidden"> */}
        <center>
          <div className="login-logo">
            <i className="fa-solid fa-right-to-bracket fa-3x"></i>
          </div>
          <h3 className="fw-bold mt-2">Login to your account</h3>
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-decoration-none">
              Create a free account
            </Link>
          </p>
        </center>

        <form
          noValidate
          className={`needs-validation ${validated ? "was-validated" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="form-floating mb-3 mt-5">
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

          <button className="btn btn-light form-control">
            Get Started &nbsp;&nbsp;
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
=======
    const { email, password } = formData;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("There is a problem in login");
        return { success: false, error };
      }

      if (data.session) {
        setAuthSession(data.session);
        navigate("/upload");
      }
      return { success: true, data };
    } catch (error) {
      console.log(error);
    }
  };

  if (!session) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-80 mt-5">
        <div className="col-10 col-md-6 col-lg-4 py-5 px-4 border border-5 rounded shadow-sm  mt-5">
          <center>
            <div className="login-logo">
              <i className="fa-solid fa-right-to-bracket fa-3x"></i>
            </div>
            <h3 className="fw-bold mt-2">Login to your account</h3>
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-decoration-none">
                Create a free account
              </Link>
            </p>
          </center>

          <form noValidate onSubmit={handleSubmit}>
            <div className="form-floating mb-3 mt-5">
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
                <i className="fa-solid fa-envelope"></i>&nbsp;Email
              </label>
              <div className="invalid-feedback">
                Please provide a valid Email!
              </div>
            </div>

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

            <button className="btn btn-light form-control">
              Get Started &nbsp;&nbsp;
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    );
  }
  else {
    navigate('/')
  }
>>>>>>> 28e6fdf48fdfdb7390e0687af8e65b096a5830eb
};

export default Login;
