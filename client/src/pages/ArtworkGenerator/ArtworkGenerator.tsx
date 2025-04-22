// src/pages/ArtworkGenerator/ArtworkGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import styles from './ArtworkGenerator.module.css';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { MessageType } from '../../utils/types';

const ArtworkGeneratorPage: React.FC = () => {
  const { user } = useSpotifyAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArtwork, setGeneratedArtwork] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Base model sdxl');

  const location = useLocation();
  const userData = location.state;
  const { connect: connectWebSocket, isConnected: wsConnected, sendMessage, lastMessage } = useWebSocket();
  const [wsResponse, setWsResponse] = useState<any>(null)

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
  };

    useEffect(() => {
        if (lastMessage && lastMessage.message) {
            const { image, story } = lastMessage.message;
        
            if (image && story) {
            setGeneratedArtwork(image);
            setGeneratedStory(story);
            setIsGenerating(false);
            }
        
            console.log('WebSocket message:', lastMessage.message);
        }
        }, [lastMessage]);

  const handleGenerateArtwork = async () => {
    setIsGenerating(true);
    console.log('Sending generation request via WebSocket');
    
    
    console.log('WebSocket message sent, waiting for response...');
    setTimeout(async () => {
        await sendMessage(MessageType.GENERATE_ARTWORK, { userData, selectedModel });
    }, 3000)
    // await sendMessage(MessageType.GENERATE_ARTWORK, { userData });
    
    // Make api call here to send the data and retrieve the image 
    // TODO: Create a loading animation here while it's loading 

    // // In a real app, this would send the data to your backend
    // setTimeout(() => {
    //   setIsGenerating(false);
    //   // Placeholder for generated artwork URL
    //   setGeneratedArtwork('/api/placeholder/800/800');
    // }, 3000);
  };

    console.log('wsReponse: ', wsResponse);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Create Your Sonic Identity</h1>
        <p>Transform your musical taste into unique visual art</p>
      </header>

      <div className={styles.generatorSection}>
        {!generatedArtwork ? (
          <>
            <div className={styles.generatorInfo}>
              <h2>How It Works</h2>
              <ol className={styles.stepsList}>
                <li>We analyze your top tracks, artists, and genres from Spotify</li>
                <li>Our AI processes these musical attributes into visual elements</li>
                <li>A unique artwork is generated representing your sonic identity</li>
              </ol>
              
              <div className={styles.preferences}>
                <h3>Model Preference</h3>
                <div className={styles.preferencesControls}>
                  <div className={styles.preferenceItem}>
                    <label>Style</label>
                    <select 
                        className={styles.selectControl}
                        value={selectedModel}
                        onChange={handleModelChange}
                    >
                      <option>Base model sdxl</option>
                      <option>Fine-tuned model</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className={styles.generateButton}
              onClick={handleGenerateArtwork}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className={styles.spinner}></div>
                  Generating Your Artwork...
                </>
              ) : (
                'Generate My Artwork'
              )}
            </button>
          </>
        ) : (
        //   <div className={styles.resultSection}>
        //     <h2>Your Sonic Identity Artwork</h2>
        //     <div className={styles.artworkContainer}>
        //       <img 
        //         src={generatedArtwork} 
        //         alt="Generated Sonic Identity" 
        //         className={styles.artworkImage}
        //       />
        //     </div>
        //     <div className={styles.actionButtons}>
        //       <button className={styles.downloadButton}>
        //         Download Artwork
        //       </button>
        //       <button className={styles.regenerateButton} onClick={() => setGeneratedArtwork(null)}>
        //         Generate New Version
        //       </button>
        //     </div>
        //   </div>
        <div className={styles.resultSection}>
        <h2>Your Sonic Identity Artwork</h2>
            <div className={styles.artworkContainer}>
            {generatedArtwork && (
                <img 
                src={generatedArtwork} 
                alt="Generated Sonic Identity" 
                className={styles.artworkImage}
                />
            )}
            {generatedStory && (
                <p className={styles.artworkStory}>{generatedStory}</p>
            )}
            </div>
            <div className={styles.actionButtons}>
            <button className={styles.downloadButton}>
                Download Artwork
            </button>
            <button className={styles.regenerateButton} onClick={() => {
                setGeneratedArtwork(null);
                setGeneratedStory(null);
            }}>
                Generate New Version
            </button>
            </div>
        </div>
      
        )}
      </div>
    </div>
  );
};

export default ArtworkGeneratorPage;