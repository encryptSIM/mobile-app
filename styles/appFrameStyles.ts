export const appFrameStyles = `
  #app-frame-container {
    width: 100vw;
    height: 100vh;
    background-color: #000;
    border-radius: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #app-screen {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #app-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Desktop/tablet - show phone frame */
  @media (min-width: 768px) {
    #app-frame-container {
      width: min(375px, 90vw);
      height: min(812px, 90vh);
      aspect-ratio: 380 / 812;
      border-radius: 25px;
      padding: 8px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1),
        0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    #app-screen {
      border-radius: 17px;
    }
  }

  /* Large desktop - maintain reasonable max size */
  @media (min-width: 1200px) {
    #app-frame-container {
      width: 380px;
      height: 812px;
    }
  }
`;
