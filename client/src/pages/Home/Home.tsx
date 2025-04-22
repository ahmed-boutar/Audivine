// // src/pages/Home/Home.tsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
// import styles from './Home.module.css';

// const HomePage: React.FC = () => {
//   const { isAuthenticated, login } = useSpotifyAuth();
//   const navigate = useNavigate();

//   const handleGetStarted = () => {
//     if (isAuthenticated) {
//       navigate('/dashboard');
//     } else {
//       login();
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <section className={styles.hero}>
//         <h1>Transform Your <span>Music</span> Into Visual Art</h1>
//         <p className={styles.tagline}>
//           Audivine creates unique artwork from your Spotify listening habits, 
//           turning your musical identity into a visual experience.
//         </p>
        
//         <div className={styles.actions}>
//           <button onClick={handleGetStarted} className={styles.ctaButton}>
//             {isAuthenticated ? 'Go to Dashboard' : 'Get Started with Spotify'}
//           </button>
//           <a href="#features" className={styles.secondaryButton}>
//             Learn More
//           </a>
//         </div>
        
//         <div className={styles.previewImage}>
//           {/* Placeholder image for the visual */}
//           <div className={styles.placeholder}>
//             <div className={styles.albumArt}></div>
//             <div className={styles.visualization}></div>
//           </div>
//         </div>
//       </section>
      
//       <section id="features" className={styles.features}>
//         <h2>How It Works</h2>
        
//         <div className={styles.featureCards}>
//           <div className={styles.featureCard}>
//             <div className={styles.featureIcon}>🎧</div>
//             <h3>Connect</h3>
//             <p>Login with your Spotify account to access your top songs and albums.</p>
//           </div>
          
//           <div className={styles.featureCard}>
//             <div className={styles.featureIcon}>🎨</div>
//             <h3>Create</h3>
//             <p>We analyze your music and transform it into a unique visual experience.</p>
//           </div>
          
//           <div className={styles.featureCard}>
//             <div className={styles.featureIcon}>🌐</div>
//             <h3>Share</h3>
//             <p>Download your sonic identity artwork or share it directly to social media.</p>
//           </div>
//         </div>
//       </section>
      
//       <section className={styles.about}>
//         <div className={styles.aboutContent}>
//           <h2>For Listeners & Artists</h2>
//           <p>
//             Whether you're a music lover wanting to visualize your unique taste or an artist
//             looking to create a visual journey through your albums, Audivine helps you express
//             your musical identity through beautiful AI-generated artwork.
//           </p>
//           <button onClick={handleGetStarted} className={styles.ctaButton}>
//             {isAuthenticated ? 'Go to Dashboard' : 'Connect with Spotify'}
//           </button>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

// src/pages/Home/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { useWebSocket } from '../../hooks/useWebSocket'; // Import the WebSocket hook
import styles from './Home.module.css';
import { MessageType } from '../../utils/types';
import { websocketService } from '../../services/websocketService';

const HomePage: React.FC = () => {
  const { isAuthenticated, login } = useSpotifyAuth();
  const navigate = useNavigate();
  
  // WebSocket state and functionality
  // const { isConnected, connect, sendMessage, lastMessage, error} = useWebSocket();
  // const [wsStatus, setWsStatus] = useState<string>('');
  // const [wsResponse, setWsResponse] = useState<string>('');

  // // Handle WebSocket connection test
  // const testWebSocketConnection = async () => {
  //   try {
  //     if (!isConnected) {
  //       setWsStatus('Connecting...');
  //       await connect();
  //       setWsStatus('Connected! Sending test message...');
        
  //       // Use the typed message approach
  //       await sendMessage(MessageType.TEST_CONNECTION, 'Hello World');
  //       // Alternative using typed messages:
  //       // await websocketService.sendTypedMessage(MessageType.TEST_CONNECTION, { message: 'Hello World' });
        
  //       setWsStatus('Test message sent! Waiting for response...');
  //     } else {
  //       // If already connected, just send a message
  //       setWsStatus('Already connected. Sending test message...');
  //       await sendMessage(MessageType.TEST_CONNECTION, 'Hello World');
  //       // await websocketService.sendTypedMessage(MessageType.TEST_CONNECTION, { message: 'Hello World' });

  //       setWsStatus('Test message sent! Waiting for response...');
  //     }
  //   } catch (err) {
  //     setWsStatus(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  //   }
  // };

  // // Listen for WebSocket responses
  // useEffect(() => {
  //   if (lastMessage && lastMessage.message) {
  //     setWsResponse(`Response received: ${lastMessage.message}`);
  //     setWsStatus('Connection test complete!');
  //   }
  // }, [lastMessage]);

  // // Handle WebSocket errors
  // useEffect(() => {
  //   if (error) {
  //     setWsStatus(`WebSocket error: ${error.message}`);
  //   }
  // }, [error]);



  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      login();
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Transform Your <span>Music</span> Into Visual Art</h1>
        <p className={styles.tagline}>
          Audivine creates unique artwork from your Spotify listening habits, 
          turning your musical identity into a visual experience.
        </p>
        
        <div className={styles.actions}>
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started with Spotify'}
          </button>
          <a href="#features" className={styles.secondaryButton}>
            Learn More
          </a>
        </div>
        
        {/* WebSocket testing section */}
        {/* <div className={styles.webSocketTest}>
          <h3>WebSocket Connection Test</h3>
          <button 
            onClick={testWebSocketConnection} 
            className={styles.testButton || styles.secondaryButton}
          >
            Test Backend Connection
          </button>
          {wsStatus && <p className={styles.statusMessage}>{wsStatus}</p>}
          {wsResponse && <p className={styles.responseMessage}>{wsResponse}</p>}
        </div> */}
        
        <div className={styles.previewImage}>
          {/* Placeholder image for the visual */}
          <div className={styles.placeholder}>
            <div className={styles.albumArt}></div>
            <div className={styles.visualization}></div>
          </div>
        </div>
      </section>
      
      <section id="features" className={styles.features}>
        <h2>How It Works</h2>
        
        <div className={styles.featureCards}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎧</div>
            <h3>Connect</h3>
            <p>Login with your Spotify account to access your top songs and albums.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3>Create</h3>
            <p>We analyze your music and transform it into a unique visual experience.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>Share</h3>
            <p>Download your sonic identity artwork or share it directly to social media.</p>
          </div>
        </div>
      </section>
      
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <h2>For Listeners & Artists</h2>
          <p>
            Whether you're a music lover wanting to visualize your unique taste or an artist
            looking to create a visual journey through your albums, Audivine helps you express
            your musical identity through beautiful AI-generated artwork.
          </p>
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {isAuthenticated ? 'Go to Dashboard' : 'Connect with Spotify'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;