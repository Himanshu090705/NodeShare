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
            tokens: "2",
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
            tokens: "2",
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
                window.alert("You cannot upgrade to this plan");
            }
            if (name !== "Free") {
                const res = await fetch(
                    "http://localhost:3001/create-checkout-session",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ priceId: priceId, name: name }),
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
                <header className="pricing-header ">
                    <h1 className="mb-3">NodeShare Pricing</h1>
                    <p>
                        Seamless and secure file sharing for individuals,
                        professionals, and businesses.
                    </p>
                </header>
                <div className=" row row-cols-1 row-cols-md-3">
                    {plans && plans.length > 0 ? (
                        plans.map((plan) => {
                            return (
                                <div className="pricing-container col">
                                    <div className="pricing-section card text-center h-100">
                                        <h3
                                            className="text-white bg-black p-1"
                                            style={{ borderRadius: "0.5rem" }}
                                        >
                                            {plan.name}
                                        </h3>
                                        <div className="card-body">
                                            <h1 className="card-title text-white ">
                                                {plan.price}
                                            </h1>
                                            <h4 className="card-title text-white ">
                                                per month
                                            </h4>
                                            <p className="text-secondary">
                                                {plan.about}
                                            </p>
                                            <button
                                                className="btn text-white bg-black w-100"
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
                                            <ul className="list-unstyled text-white">
                                                {plan.features &&
                                                plan.features.length > 0 ? (
                                                    plan.features.map(
                                                        (feature) => {
                                                            return (
                                                                <li
                                                                    style={{
                                                                        margin: "2rem 2rem",
                                                                    }}
                                                                >
                                                                    {feature}
                                                                </li>
                                                            );
                                                        }
                                                    )
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