import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/payment.css";

export default function Payment() {
  const navigate = useNavigate();

  const storedData = JSON.parse(sessionStorage.getItem("pendingBooking") || "{}");

  const [bookingData] = useState(
    storedData.doctorId
      ? storedData
      : {
          doctorName: "Doctor",
          specialty: "General",
          date: new Date().toISOString().split("T")[0],
          time: "10:00 AM",
          location: "at-clinic",
          amount: 500,
        }
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = (e) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvv || !cardName) {
      setError("Please fill in all card details");
      return;
    }

    setProcessing(true);
    setError("");

    setTimeout(() => {
      sessionStorage.removeItem("pendingBooking");
      setSuccess(true);
      setProcessing(false);
    }, 1000);
  };

  if (success) {
    return (
      <div className="payment-root">
        <div className="payment-success-card">
          <div className="payment-success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your appointment with <strong>Dr. {bookingData.doctorName}</strong></p>
          <p>{new Date(bookingData.date).toDateString()} at {bookingData.time}</p>
          <div className="payment-success-btns">
            <button onClick={() => navigate("/patient")}>Go to Dashboard</button>
            <button onClick={() => navigate("/booking")}>Book Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-root">
      <div className="payment-container">
        <button className="payment-back" onClick={() => navigate("/booking")}>
          ← Back
        </button>

        {/* Booking Summary */}
        <div className="payment-summary">
          <h2>Payment Details</h2>
          <div className="payment-booking-info">
            <div className="payment-info-row">
              <span>Doctor</span>
              <strong>Dr. {bookingData.doctorName}</strong>
            </div>
            <div className="payment-info-row">
              <span>Date</span>
              <strong>{new Date(bookingData.date).toDateString()}</strong>
            </div>
            <div className="payment-info-row">
              <span>Time</span>
              <strong>{bookingData.time}</strong>
            </div>
          </div>
          <div className="payment-amount">
            <span>Total</span>
            <strong>{bookingData.amount} EGP</strong>
          </div>
        </div>

        {/* Payment Form */}
        <form className="payment-form" onSubmit={handlePayment}>
          <h3>Card Info (Demo)</h3>

          <div className="payment-field">
            <label>Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          <div className="payment-field">
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>

          <div className="payment-row">
            <div className="payment-field">
              <label>Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div className="payment-field">
              <label>CVV</label>
              <input
                type="password"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="payment-error">{error}</p>}

          <button type="submit" className="payment-btn" disabled={processing}>
            {processing ? "Processing..." : `Pay ${bookingData.amount} EGP`}
          </button>

          <p className="payment-secure">
            <span>🔒</span> Secured & Encrypted Payment
          </p>
        </form>
      </div>
    </div>
  );
}