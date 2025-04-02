import { useNavigate } from "react-router-dom";
import { supabase } from "../../../server/db/connect";
import axios from "axios";

function Subscriptions() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      price: "$0",
      about: "Basic features for individuals.",
      tokens: "50",
      priceId: "price_1R98YRERYVwyvKr5R72PXpZb",
      features: [
        "✔ Basic Support",
        "✔ Community Access",
        "✔ File Sharing up to 100MB",
        "✔ Basic File Conversion",
        "✔ Limited Bandwidth",
      ],
    },
    {
      name: "Pro",
      price: "$50",
      tokens: "100",
      priceId: "price_1R98YuERYVwyvKr5bFhpi8LM",
      about: "Advanced features for professionals.",
      features: [
        "✔ 100 tokens per month",
        "✔ Access to Pro Features",
        "✔ File Sharing up to 1GB",
        "✔ Advanced File Conversion",
        "✔ Customizable Sharing Options",
      ],
    },
    {
      name: "Premium",
      price: "$100",
      priceId: "price_1R98ZXERYVwyvKr5D0HARPTl",
      tokens: "Unlimited",
      about: "All features for businesses.",
      features: [
        "✔ Unlimited tokens",
        "✔ Exclusive Feature",
        "✔ Customizable Sharing Options",
        "✔ Basic File Conversion",
        "✔ Team Collaboration Tools",
      ],
    },
  ];
  async function handleSubscribePlan(name, tokens, priceId) {
    try {
      if (name === "Free") {
        const user = await supabase.auth.getUser();
        const id = user.data.user.id;

        const response = await supabase
          .from("subscriptions")
          .update({ plan: "Free", tokens: "50" })
          .eq("userId", id)
          .select();

        if(response) {
          window.alert("Plan changed");
          navigate('/profile');
        } 
          
      } else {
        const res = await fetch(
          "http://localhost:3001/create-checkout-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priceId }),
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Stripe Checkout URL:", data.url);

        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  }

  return (
    <>
      <div className="container py-5">
        <h1 className="text-center mb-5" style={{ fontSize: "5rem" }}>
          NodeShare Pricing
        </h1>
        <h3
          className="text-center text-muted mb-5"
          style={{ fontSize: "1.5rem" }}
        >
          Seamless and secure file sharing for individuals, professionals, and
          businesses.
        </h3>
        <h2 className="text-center mb-5" style={{ fontSize: "2rem" }}>
          Choose Your Plan
        </h2>
        <div className="row row-cols-1 row-cols-md-3 g-3">
          {plans && plans.length > 0 ? (
            plans.map((plan) => {
              return (
                <div className="col">
                  <div className="card border-primary text-center h-100">
                    <div
                      className="card-header text-white bg-primary"
                      style={{ backgroundColor: "#5c66f4" }}
                    >
                      <b>{plan.name}</b>
                    </div>
                    <div className="card-body">
                      <h1 className="card-title">{plan.price}</h1>
                      <h4 className="card-title text-secondary">per month</h4>
                      <p className="card-text">{plan.about}</p>
                      <button
                        className="btn btn-primary text-white w-100"
                        onClick={() =>
                          handleSubscribePlan(
                            plan.name,
                            plan.tokens,
                            plan.priceId
                          )
                        }
                      >
                        Use this plan
                      </button>
                      <ul className="list-unstyled">
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feature) => {
                            return (
                              <li style={{ margin: "2rem 2rem" }}>{feature}</li>
                            );
                          })
                        ) : (
                          <></>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
export default Subscriptions;
