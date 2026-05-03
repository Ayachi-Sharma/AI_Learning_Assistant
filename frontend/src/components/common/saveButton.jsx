import React from "react";
import styled from "styled-components";

const SaveButton = ({ onClick }) => {

  const handleClick = (e) => {
    const btn = e.currentTarget;

    btn.classList.remove("clicked");
    void btn.offsetWidth;
    btn.classList.add("clicked");

    // console.log("Save button clicked");
    onClick?.(e);
  };

  return (
    <StyledWrapper>
      <button onClick={handleClick} className="flex gap-2">
        <svg height={24} width={24} viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor" />
        </svg>

        <span>Save Profile</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    display: flex;
    align-items: center;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;
    font-size: 17px;
    padding: 0.8em 1.6em;
    color: white;
    background: linear-gradient(to right, #4F46E5, #7C3AED, #6D28D9);
    border: none;
    letter-spacing: 0.05em;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    transition: transform .12s ease;
  }

  button:active {
    transform: scale(0.95);
  }

  /* ⭐ SHADOW BURST */
  button.clicked {
    animation: shadowBurst .7s ease;
  }

  @keyframes shadowBurst {
    0% { box-shadow: 0 0 0 rgba(0,0,0,0); }
    40% {
      box-shadow:
        0 0 18px rgba(124,58,237,.9),
        0 0 45px rgba(109,40,217,.7),
        0 0 70px rgba(79,70,229,.6);
    }
    100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
  }

  button svg {
    margin-right: 6px;
    transform: rotate(30deg);
    transition: transform .5s cubic-bezier(0.76,0,0.24,1);
  }

  /* ⭐ HOVER STATE */
  button:hover svg {
    transform: translateX(5px) rotate(90deg);
  }

  button span {
    white-space: nowrap;
    transition: transform .5s cubic-bezier(0.76,0,0.24,1);
  }

  button:hover span {
    transform: translateX(7px);
  }

  /* ⭐ CLICK — SYNC ROCKET + TEXT */
  button.clicked svg {
    animation: rocketLaunch .7s ease;
  }

  button.clicked span {
    animation: textShift .7s ease;
  }

  @keyframes rocketLaunch {
    0% { transform: translateX(5px) rotate(90deg); }
    45% { transform: translateX(30px) rotate(90deg); }
    100% { transform: translateX(5px) rotate(90deg); }
  }

  @keyframes textShift {
    0% { transform: translateX(7px); }
    45% { transform: translateX(18px); }
    100% { transform: translateX(7px); }
  }
`;

export default SaveButton;