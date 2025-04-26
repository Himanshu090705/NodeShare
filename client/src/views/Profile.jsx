import { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../../server/db/connect";

function Profile() {
  const navigate = useNavigate();
  const handleEditProfile = () => {
    navigate("/edit");
  };

  const [data, setData] = useState(null);
  const [plans, setPlans] = useState(null);

  const render = useCallback(async () => {
    const userResponse = await supabase.auth.getUser();
    setData(userResponse.data);

    const subscriptionResponse = await supabase
      .from("subscriptions")
      .select()
      .eq("userId", userResponse.data.user.id);

    if (subscriptionResponse.data && subscriptionResponse.data.length > 0) {
      setPlans(subscriptionResponse.data[0]);
    } else {
      console.error("No subscription found for this user.");
    }
  }, []);

  useEffect(() => {
    render();
  }, [render]);

  if (!data || !plans) {
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
      <div className="container ">
        <div className="card p-4 shadow-lg  profile-box">
          <div className="text-center">
            <img
              src={user_metadata.avatar_url || "demo-avatar.png"}
              className="rounded-circle mb-2"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
              }}
              alt="Profile"
            />
            <h4 className="text-white" id="fullName">
              {!user_metadata.user_metadata
                ? user_metadata.full_name
                : user_metadata.user_metadata.full_name}
            </h4>
            <p id="email" className="text-white ">
              {user_metadata.email}
            </p>
          </div>
          <div className="mt-2 text-center">
            <button
              className="btn bg-white text-black"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          </div>
          <hr />
          <div className="mt-3">
            <label className="text-white form-label">
              Plan Type | <NavLink to="/subscriptions">Change Plan</NavLink>
            </label>
            <input
              type="text"
              id="planType"
              className="form-control"
              value={plans?.plan}
              disabled
            />
          </div>
          <div className="mt-3">
            <label className="text-white form-label">Tokens Left</label>
            <input
              type="text"
              id="tokensLeft"
              className="form-control"
              value={plans?.tokens}
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
