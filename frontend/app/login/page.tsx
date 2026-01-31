'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import styled from 'styled-components';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <Link href="/" className="back-home_btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Home
      </Link>
      <div className="container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="header">
            <label className="title">Sign In to Your Account</label>
            <p className="description">Access your AI-powered ophthalmology dashboard and screening records.</p>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="input_container">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" />
              <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
            </svg>
            <input
              id="email_field"
              className="input_field"
              type="email"
              required
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input_container">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22" />
              <path d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9" />
              <circle cx="12" cy="11" r="3" />
            </svg>
            <input
              id="password_field"
              className="input_field"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F5D6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F5D6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button className="sign-in_btn" type="submit" disabled={isLoading}>
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          </button>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              Need an account? Create Patient Account
            </Link>
          </div>
        </form>

        <div className="testimonial">
          <p className="quote">"Vision is the art of seeing what is invisible to others."</p>
          <div className="quote-divider" />
          <span className="quote-author">— Jonathan Swift</span>
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

  .back-home_btn {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #5F5D6B;
    text-decoration: none;
    transition: all 0.2s;
    padding: 8px 12px;
    border-radius: 6px;
    
    &:hover {
      background-color: #f3f4f6;
      color: #115DFC;
    }
  }

  .container {
    height: 480px;
    display: flex;
    box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05), 0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
    border-radius: 9px;
    max-width: 600px;
    width: 100%;
    overflow: hidden;
    background-color: #fff;
    position: relative;
  }

  .login-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 15px;
    padding: 30px;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .title {
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    color: #2B2B2F;
    margin-bottom: 10px;
  }

  .description {
    max-width: 90%;
    margin: auto;
    font-weight: 600;
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    color: #5F5D6B;
  }

  .input_container {
    width: 100%;
    height: fit-content;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .icon {
    width: 18px;
    position: absolute;
    z-index: 99;
    left: 12px;
    bottom: 11px;
  }

  .input_field {
    width: 100%;
    height: 40px;
    padding: 0 45px 0 40px;
    border-radius: 7px;
    outline: none;
    border: 1px solid #e5e5e5;
    background-color: #ffffff;
    color: #2b2b2f !important;
    font-size: 13px;
    filter: drop-shadow(0px 1px 0px #efefef)
      drop-shadow(0px 1px 0.5px rgba(239, 239, 239, 0.5));
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);

    &::placeholder {
      color: #8d8ca1 !important;
      opacity: 0.8;
    }

    /* Fix autofill grey text issue */
    &:-webkit-autofill,
    &:-webkit-autofill:hover, 
    &:-webkit-autofill:focus, 
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
      -webkit-text-fill-color: #2b2b2f !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  .input_field.no-icon {
    padding: 0 0 0 15px;
  }

  .input_field:focus {
    border: 1px solid transparent;
    box-shadow: 0px 0px 0px 2px #115DFC;
    background-color: #ffffff !important;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    bottom: 10px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 0;
    color: #8d8ca1;
    transition: color 0.2s;

    &:hover {
      color: #115DFC;
    }
  }

  .sign-in_btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 40px;
    background: linear-gradient(180deg, #4480FF 0%, #115DFC 50%, #0550ED 100%);
    box-shadow: 0px 0.5px 0.5px #EFEFEF, 0px 1px 0.5px rgba(239, 239, 239, 0.5);
    border-radius: 5px;
    border: 0;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 15px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.15, 0.83, 0.66, 1);
  }

  .sign-in_btn:hover {
    transform: scale(1.01) translateY(-2px);
    box-shadow: 0 10px 20px 0#054eed6b;
  }

  .sign-in_btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .testimonial {
    width: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 30px;
    background: linear-gradient(358.31deg,#fff -24.13%,hsla(0,0%,100%,0) 338.58%),linear-gradient(89.84deg,rgba(230,36,174,.05) .34%,rgba(94,58,255,.05) 16.96%,rgba(10,136,255,.05) 34.66%,rgba(75,191,80,.05) 50.12%,rgba(137,206,0,.05) 66.22%,rgba(239,183,0,.05) 82%,rgba(246,73,0,.05) 99.9%);
    border-radius: 0 9px 9px 0;
    border-left: 1px solid #f3f4f6;
  }

  @media (max-width: 640px) {
    .testimonial {
      display: none;
    }
    .container {
      max-width: 350px;
    }
  }

  .quote {
    color: #4d4c6d;
    font-size: 14px;
    text-align: center;
    font-weight: 700;
    line-height: 1.5;
    font-style: italic;
  }

  .quote-divider {
    width: 40px;
    height: 2px;
    background-color: #115DFC;
    border-radius: 2px;
    opacity: 0.3;
  }

  .quote-author {
    color: #8d8ca1;
    font-size: 11px;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;


