import React from 'react';
import 'font-awesome/css/font-awesome.min.css';
import './PricingPage.css';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">OMNI AI</div>
      <ul className="navbar-links">
        <li><Link href="/userPrompts" className="btn-hover color-3">Home</Link></li>
        <li><Link href="/userPrompts" className="btn-hover color-3">User Page</Link></li>
        <li><Link href="/" className="btn-hover color-3">Omni.Ai</Link></li>
        <li><Link href="/contact" className="btn-hover color-3">Contact</Link></li>
      </ul>
    </nav>
  );
};


const PricingTable: React.FC = () => {
  const router = useRouter();

  const handleCheckout = async (priceId: string, planId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId });
        if (result.error) {
          console.error('Failed to redirect to checkout:', result.error.message);
        }
      } else {
        console.error('Stripe has not been initialized');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  return (
    <section className="pricing-table">
      <div className="container-fluid">
        <div className="container">
          <div className="row d-flex justify-content-center" >
            <div className="col-sm-4" >
              <div className="card text-center">
                <div className="title">
                  <i className="fa fa-paper-plane" aria-hidden="true"></i>
                  <h2>Omni Starter</h2>
                </div>
                <div className="price">
                  <h4><sup>$</sup>20</h4>
                </div>
                <div className="option">
                  <ul>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 250 Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 10,000 Tokens</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 20 Free Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Limited Api Features</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Limited Beam Usage</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 24/7 Discord Chat Support</li>
                  </ul>
                </div>
                <a onClick={() => handleCheckout("price_1PMAlHE4H116aDHAAEluoUjo", "Omni Starter")}>Order Now</a>
              </div>                              
            </div>
            {/* END Col one */}
            <div className="col-sm-4" >
              <div className="card text-center">
                <div className="title">
                  <i className="fa fa-plane" aria-hidden="true"></i>
                  <h2>OMNI Quantum</h2>
                </div>
                <div className="price">
                  <h4><sup>$</sup>50</h4>
                </div>
                <div className="option">
                  <ul>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 500,000 Token Prompt Usage</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 400 Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 100 Free Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Beam Usage Upgrade</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> More Api Features</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Integrated Api Features</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 24/7 Discord Chat Support</li>
                  </ul>
                </div>
                <a onClick={() => handleCheckout("price_1PMAlHE4H116aDHAQrWOqRmM", "Omni Quantum")}>Order Now</a>
              </div>
            </div>
            {/* END Col two */}
            <div className="col-sm-4">
              <div className="card text-center">
                <div className="title">
                  <i className="fa fa-rocket" aria-hidden="true"></i>
                  <h2>OMNI Interstellar</h2>
                </div>
                <div className="price">
                  <h4><sup>$</sup>250</h4>
                </div>
                <div className="option">
                  <ul>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 2000000 Token Prompt Usage</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 14500 Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 600 Free Credits</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Unlimited Api Features</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Unlimited Beam Features</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> 24/7 priority support</li>
                    <li><i className="fa fa-check" aria-hidden="true"></i> Advanced security features</li>
                  </ul>
                </div>
                <a onClick={() => handleCheckout("price_1Mky16E4H116aDHAXFh3PfV4", "Omni Enterprise Stellar")}>Order Now</a>
              </div>
            </div>
            {/* END Col three */}
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingPage: React.FC = () => {
  return (
    <div className="pricing-page">
      <NavBar />
      
        <main className="main-content">
          <PricingTable />
        </main>
      
    </div>
  );
};

export default PricingPage;