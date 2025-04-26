import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../server/db/connect";

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const name = searchParams.get("name");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(sessionId);
    if (!sessionId) return;

    async function fetchPaymentDetails() {
      try {
        const response = await fetch(
          `http://localhost:3001/payment-status?session_id=${sessionId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment details");
        }

        const data = await response.json(); // Await JSON parsing
        setPaymentStatus(data);

        const user = await supabase.auth.getUser();
        const id = user.data.user.id;

        if (data.status === "paid") {
          if (name === "Pro") {
            const updateResponse = await supabase
              .from("subscriptions")
              .update({ plan: "Pro", tokens: "100" })
              .eq("userId", id);

            if (updateResponse.error) {
              console.error(
                "Failed to update subscription:",
                updateResponse.error,
              );
            } else {
              window.alert("Plan changed");
              navigate("/profile");
            }
          } else if (name === "Premium") {
            const updateResponse = await supabase
              .from("subscriptions")
              .update({ plan: "Premium", tokens: "Unlimited" })
              .eq("userId", id);

            if (updateResponse.error) {
              console.error(
                "Failed to update subscription:",
                updateResponse.error,
              );
            } else {
              window.alert("Plan changed");
              navigate("/profile");
            }
          }
        } else {
          console.error("Payment not completed");
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    }

    fetchPaymentDetails();
  }, [sessionId]);
  return <></>;
}
export default Success;
