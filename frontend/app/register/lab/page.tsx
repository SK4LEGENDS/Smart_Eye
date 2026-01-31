'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

export default function RegisterLabPage() {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="info-section">
          <div className="header">
            <label className="title">Lab Portal Access</label>
            <p className="description">Diagnostic facility accounts are provisioned exclusively by system administrators to maintain institutional verification standards.</p>
          </div>

          <div className="notice-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <h3>System Provisioning Required</h3>
            <p>To integrate your diagnostic center with our AI network, please contact our laboratory coordinator at <strong>labs@smarteyecare.com</strong> for onboard procedures.</p>
            <div className="mt-8 flex justify-center gap-6">
              <Link href="/login" className="back-link secondary">
                Return to Login
              </Link>
              <Link href="/" className="back-link primary">
                Back to Home
              </Link>
            </div>
          </div>

        </div>

        <div className="testimonial lab-theme">
          <p className="quote">"Ensuring clarity and clinical precision through advanced ocular analysis."</p>
          <div className="quote-divider" />
          <span className="quote-author">— Lab Precision Gate</span>
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
    background-color: #f5f3ff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #ede9fe;
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
      color: #7c3aed;
      margin: 0;
    }

    p {
      font-size: 12px;
      line-height: 1.6;
      color: #6d28d9;
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
      background-color: #9333ea;
      color: #ffffff;
      &:hover {
        background-color: #7e22ce;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
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
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%);
    border-radius: 0 9px 9px 0;
    border-left: 1px solid #f3f4f6;
  }

  @media (max-width: 640px) {
    .testimonial { display: none; }
    .container { max-width: 350px; }
  }

  .quote {
    color: #6b21a8;
    font-size: 14px;
    text-align: center;
    font-weight: 700;
    line-height: 1.5;
    font-style: italic;
  }

  .quote-divider {
    width: 40px;
    height: 2px;
    background-color: #a855f7;
    border-radius: 2px;
    opacity: 0.3;
  }

  .quote-author {
    color: #a855f7;
    font-size: 11px;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;
