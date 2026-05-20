import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;

  position: absolute;

  left: 0;
  top: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  user-select: none;

  font-size: 1.5rem;
  color: rgba(255, 255, 255, 1);
  text-align: center;
  text-transform: uppercase;
  text-shadow: none;

  background:
    radial-gradient(circle at 50% 40%, rgba(${props => props.theme.primaryBackground || '192, 28, 40'}, 0.22), transparent 28%),
    rgba(${props => props.theme.secondaryBackground ||'10, 10, 12'}, 0.86);
  backdrop-filter: blur(22px);

  p {
    padding: 18px 28px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.045);
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  span {
    margin-top: 16px;
    font-size: 1rem;
    opacity: 0.72;
    letter-spacing: 0.04em;
  }
`;

export const Buttons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 42px;

  button {
    height: 46px;
    min-width: 132px;
    margin: 0 8px;
    border-radius: ${props => props.theme.borderRadius || '0px'};

    display: flex;
    justify-content: center;
    align-items: center;

    color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);;
    font-size: 0.8rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;

    opacity: 0.8;
    transition: all 0.2s;

    background: rgba(255, 255, 255, 0.045);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);

    &:hover {
      opacity: 1;
      border-color: rgba(${props => props.theme.primaryBackground ||'192, 28, 40'}, 0.8);
      background: rgba(${props => props.theme.primaryBackground ||'192, 28, 40'}, 0.62);
    }
  }
`;
