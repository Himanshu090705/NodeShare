import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../server/db/connect";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const [data, setData] = useState({
    avatar_url: "",
    fullName: "",
    username: "",
    email: "",
  });

  const navigate = useNavigate();

  const fetchUserDetails = useCallback(() => {
    supabase.auth.getUser().then((response) => {
      const user = response.data.user;
      if (user) {
        setData({
          avatar_url: user.user_metadata.avatar_url,
          fullName: !user.user_metadata.user_metadata
            ? user.user_metadata.full_name
            : user.user_metadata.user_metadata.full_name,
          username: !user.user_metadata.user_metadata
            ? user.user_metadata.user_name
            : user.user_metadata.user_metadata.user_name,
          email: user.email,
        });
      }
    });
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    const user = supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.auth.updateUser({
        data: {
          user_metadata: {
            full_name: data.fullName,
            user_name: data.username,
          },
        },
      });

      if (error) {
        console.error("Error updating user details:", error);
        window.alert("Error updating user details");
      } else {
        navigate("/profile");
      }
    }
  };

  if (!data.email) {
    return (
      <div className="container mt-5">
        <div
          className="card p-4 d-flex justify-content-center shadow-lg mx-auto"
          style={{ maxWidth: "400px" }}
        >
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <div
          className="card p-4 shadow-lg mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <h3 className="text-center">Edit Profile</h3>
          <hr />
          <h5>Personal Info</h5>
          <div className="text-center">
            <img
              src={data.avatar_url}
              alt="Profile Picture"
              className="rounded-circle mb-3"
              height="50%"
              width="50%"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              name="fullName"
              value={data.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={data.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="text"
              className="form-control"
              id="email"
              name="email"
              value={data.email}
              disabled
            />
          </div>

          <hr />

          <h5>Billing</h5>
          <div className="mb-3">
            <label className="form-label">Card Number</label>
            <input
              type="text"
              className="form-control"
              id="cardNumber"
              placeholder="**** **** **** 1234"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Expiry Date</label>
            <input
              type="month"
              className="form-control"
              id="expiryDate"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">CVV</label>
            <input
              type="password"
              className="form-control"
              id="cvv"
              placeholder="***"
              disabled
            />
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-success" onClick={handleSaveChanges}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
