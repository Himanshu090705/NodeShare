import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../server/db/connect";

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;
    async function fetchPaymentDetails() {
      try {
        const response = await fetch(
          `http://localhost:3001/payment-status?session_id=${sessionId}`
        );
        const data = response.json();
        setPaymentStatus(data);

        if (response) {
          const user = await supabase.auth.getUser();
          const id = user.data.user.id;

          const response = await supabase
            .from("subscriptions")
            .update({ plan: "Pro", tokens: "100" })
            .eq("userId", id)
            .select();

          if (response) {
            window.alert("Plan changed");
            navigate("/profile");
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchPaymentDetails();
  }, [sessionId]);
  return <></>
}
export default Success;
