import { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

function Payments() {
  const [cardNumber, setCardNumber] = useState('');
  const { cartId, cart, fetchCart } = useCart();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:1323/payments', {
        cart_id: cartId,
        card_number: cardNumber,
        amount: cart.reduce((sum, item) => sum + item.price, 0)
      });
      setMessage('Payment successful!');
      fetchCart([]);
    } catch (error) {
      setMessage('Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Payments</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Card number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
        <button type="submit">Pay</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Payments;