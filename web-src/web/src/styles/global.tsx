import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle<{theme: any}>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: 0;
    font-family: '${props => props.theme.fontFamily}', sans-serif;
  }

  :root {
    --w2f-red: #c01c28;
    --w2f-red-hot: #ef4444;
    --w2f-black: #050507;
    --w2f-panel: rgba(10, 10, 12, 0.78);
    --w2f-panel-soft: rgba(255, 255, 255, 0.045);
    --w2f-border: rgba(255, 255, 255, 0.09);
    --w2f-text: rgba(240, 242, 248, 0.94);
    --w2f-muted: rgba(240, 242, 248, 0.52);
  }
  
  html,
  body,
  #root {
    background: transparent;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  button {
    cursor: pointer;
    outline: 0;
  }

  ::selection {
    color: #fff;
    background: rgba(192, 28, 40, 0.55);
  }

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(239, 68, 68, 0.55);
    border-radius: 999px;
  }
`;
