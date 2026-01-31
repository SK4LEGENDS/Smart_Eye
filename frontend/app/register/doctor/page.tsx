'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

export default function RegisterDoctorPage() {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="info-section">
          <div className="header">
            <label className="title">Doctor Registration Restricted</label>
            <p className="description">Professional accounts are provisioned exclusively by system administrators to ensure network security and clinical verification.</p>
          </div>

          <div className="notice-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#115DFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h3>Account Provisioning Required</h3>
            <p>If you are a licensed ophthalmologist and wish to join our network, please contact our administrative team at <strong>admin@smarteyecare.com</strong> with your credentials.</p>
          </div>

          <div className="mt-8 flex justify-center gap-6">
            <Link href="/login" className="back-link secondary">
              Return to Login
            </Link>
            <Link href="/" className="back-link primary">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="testimonial doctor-theme">
          <p className="quote">"The eyes are the windows to the soul, and AI is the light that helps us see clearly."</p>
          <div className="quote-divider" />
          <span className="quote-author">— Visionary Insight</span>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  overflow: hidden;

  .container {
    height: 480px;
    display: flex;
    box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05), 0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
    border-radius: 9px;
    max-width: 650px;
    width: 100%;
    overflow: hidden;
    background-color: #fff;
  }

  .info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    text-align: center;
  }

  .header {
    margin-bottom: 30px;
  }

  .title {
    display: block;
    font-weight: 700;
    font-size: 20px;
    color: #2B2B2F;
    margin-bottom: 10px;
  }

  .description {
    font-weight: 500;
    font-size: 13px;
    line-height: 1.6;
    color: #5F5D6B;
  }

  .notice-card {
    background-color: #f0f7ff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e1effe;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    svg {
      margin-bottom: 8px;
    }

    h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1a56db;
      margin: 0;
    }

    p {
      font-size: 12px;
      line-height: 1.6;
      color: #1e429f;
      margin: 0;
    }
  }

  .back-link {
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.2s;
    
    &.primary {
      background-color: #115DFC;
      color: #ffffff;
      &:hover {
        background-color: #004ecc;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(17, 93, 252, 0.2);
      }
    }

    &.secondary {
      color: #5F5D6B;
      border: 1px solid #e5e5e5;
      &:hover {
        background-color: #f3f4f6;
        color: #2B2B2F;
      }
    }
  }

  .testimonial {
    width: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 30px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
    border-radius: 0 9px 9px 0;
    border-left: 1px solid #f3f4f6;
  }

  @media (max-width: 640px) {
    .testimonial { display: none; }
    .container { max-width: 350px; }
  }

  .quote {
    color: #166534;
    font-size: 14px;
    text-align: center;
    font-weight: 700;
    line-height: 1.5;
    font-style: italic;
  }

  .quote-divider {
    width: 40px;
    height: 2px;
    background-color: #22c55e;
    border-radius: 2px;
    opacity: 0.3;
  }

  .quote-author {
    color: #22c55e;
    font-size: 11px;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;
