import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../server/db/connect";

function Profile() {
  const navigate = useNavigate();
  const handleEditProfile = () => {
    navigate("/edit");
  };

  const [data, setData] = useState(null);

  const render = useCallback(() => {
    supabase.auth.getUser().then((response) => {
      console.log(response.data);
      setData(response.data);
    });
  }, []);

  useEffect(() => {
    render();
  }, [render]);

  if (!data) {
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

  const { user_metadata } = data.user;

  return (
    <>
      <div className="container mt-5">
        <div
          className="card p-4 shadow-lg mx-auto"
          style={{ maxWidth: "400px" }}
        >
          <div className="text-center">
            <img
              src={user_metadata.avatar_url}
              className="rounded-circle mb-3"
              width="50%"
              height="50%"
            />
            <h4 id="fullName">
              {!user_metadata.user_metadata
                ? user_metadata.full_name
                : user_metadata.user_metadata.full_name}
            </h4>
            <p id="email" className="text-muted">
              {user_metadata.email}
            </p>
          </div>
          <div className="mt-4 text-center">
            <button className="btn btn-success" onClick={handleEditProfile}>
              Edit Profile
            </button>
          </div>
          <hr />
          <div className="mt-3">
            <label className="form-label">Plan Type</label>
            <input
              type="text"
              id="planType"
              className="form-control"
              value="Premium"
              disabled
            />
          </div>
          <div className="mt-3">
            <label className="form-label">Tokens Left</label>
            <input
              type="text"
              id="tokensLeft"
              className="form-control"
              value="50"
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
