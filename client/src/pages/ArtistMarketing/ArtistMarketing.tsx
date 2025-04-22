// src/pages/ArtistMarketing/ArtistMarketing.tsx
import React, { useState, useEffect } from 'react';
import styles from './ArtistMarketing.module.css';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { MessageType } from '../../utils/types';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
interface SongDetail {
    title: string;
    lyricsAndDescription: string;
}
  
interface FormData {
    selectedModel: string;
    albumTitle: string;
    artistName: string;
    genre: string;
    description: string;
    imageFile: File | null;
    songDetails: SongDetail[];
}

const ArtistMarketingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    selectedModel: 'Base model sdxl',
    albumTitle: '',
    artistName: '',
    genre: '',
    description: '',
    imageFile: null,
    songDetails: []
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<string[]>([]);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const { connect: connectWebSocket, isConnected: wsConnected, sendMessage, lastMessage } = useWebSocket();
  const location = useLocation();
  const userData = location.state;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setPreviewUrl(null);
  };

  const handleAddSong = () => {
    setFormData(prev => ({
      ...prev,
      songDetails: [...prev.songDetails, { title: '', lyricsAndDescription: '' }]
    }));
  };

  const handleSongDetailChange = (index: number, field: keyof SongDetail, value: string) => {
    const updatedSongs = [...formData.songDetails];
    updatedSongs[index][field] = value;
    setFormData(prev => ({ ...prev, songDetails: updatedSongs }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleGenerateAssets = () => {
    setIsGenerating(true);
    console.log('Form data from artist marketing page:', formData);
    // console.log('Sending Spotify auth code via WebSocket');
    
    
    console.log('WebSocket message sent, waiting for response...');
    setTimeout(async () => {
        await sendMessage(MessageType.GENERATE_MARKETING, { formData });
    }, 3000)
  };

  useEffect(() => {
    if (lastMessage && lastMessage.message) {
        const { song_images, custom_album_story } = lastMessage.message;
    
        if (song_images && custom_album_story) {
        setGeneratedAssets(song_images);
        setGeneratedStory(custom_album_story);
        setIsGenerating(false);
        }
    
        console.log('WebSocket message in ArtistMarketing Page:', lastMessage.message);
    }
    }, [lastMessage]);

  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 
    'Classical', 'Reggae', 'Folk', 'Metal', 'Blues', 'Latin', 'Other'
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Artist Marketing Suite</h1>
        <p>Create compelling visuals for your music releases</p>
      </header>

      {step === 1 ? (
        <div className={styles.formSection}>
          <h2>Tell Us About Your Music</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="albumTitle">Album/Single Title</label>
              <input
                type="text"
                id="albumTitle"
                name="albumTitle"
                value={formData.albumTitle}
                onChange={handleInputChange}
                required
                placeholder="Enter your album or single title"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="artistName">Artist Name</label>
              <input
                type="text"
                id="artistName"
                name="artistName"
                value={formData.artistName}
                onChange={handleInputChange}
                required
                placeholder="Enter artist or band name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="genre">Primary Genre</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Album Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the overall story, vibe, and intention behind the album..."
                required
              />
              <label htmlFor="selectedModel">Style</label>
                <select 
                    className={styles.selectControl}
                    id="selectedModel"
                    name="selectedModel"
                    value={formData.selectedModel}
                    onChange={handleInputChange}
                >
                    <option>Base model sdxl</option>
                    <option>Fine-tuned model</option>
                </select>
            </div>

            {formData.songDetails.map((song, index) => (
              <div className={styles.formGroup} key={index}>
                <label>Song Title</label>
                <input
                  type="text"
                  value={song.title}
                  onChange={(e) => handleSongDetailChange(index, 'title', e.target.value)}
                  placeholder="Enter the name of the song"
                />
                <textarea
                  value={song.lyricsAndDescription}
                  onChange={(e) => handleSongDetailChange(index, 'lyricsAndDescription', e.target.value)}
                  rows={6}
                  placeholder={`LYRICS:\nWrite your lyrics here\n\nSONG DESCRIPTION:\nDescribe the feeling, story, or intention behind the song...`}
                />
              </div>
            ))}

            <button type="button" className={styles.addButton} onClick={handleAddSong}>+ Add Song</button>

            <div className={styles.formGroup}>
              <label htmlFor="imageFile">Upload Reference Image (Optional)</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="imageFile" className={styles.fileLabel}>
                  Choose File
                </label>

                
                <span className={styles.fileName}>
                  {formData.imageFile ? formData.imageFile.name : 'No file chosen'}
                </span>
                {formData.imageFile && (
                  <button type="button" onClick={handleRemoveFile} className={styles.removeFileButton}>
                    Remove File
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className={styles.imagePreview}>
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
              
            </div>

            <button type="submit" className={styles.submitButton}>Continue</button>
          </form>
        </div>
      ) : (
        <div className={styles.assetsSection}>
          <h2>Generate Marketing Assets</h2>
          
          <div className={styles.assetOptions}>
            <div className={styles.assetTypeCard}>
              <div className={styles.assetTypeIcon}>
                <i className="bi bi-disc"></i>
              </div>
              <h3>Album Artwork</h3>
              <p>Square format artwork for streaming platforms and physical releases</p>
            </div>
            
            <div className={styles.assetTypeCard}>
              <div className={styles.assetTypeIcon}>
                <i className="bi bi-phone"></i>
              </div>
              <h3>Social Media Assets</h3>
              <p>Promotional graphics optimized for Instagram, Facebook, and Twitter</p>
            </div>
            
            <div className={styles.assetTypeCard}>
              <div className={styles.assetTypeIcon}>
                <i className="bi bi-laptop"></i>
              </div>
              <h3>Web Banners</h3>
              <p>Website headers, Spotify profile banners, and YouTube cover images</p>
            </div>
          </div>
          
          {generatedAssets.length === 0 ? (
            <button 
              className={styles.generateButton}
              onClick={handleGenerateAssets}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className={styles.spinner}></div>
                  Creating Your Assets...
                </>
              ) : (
                'Generate Marketing Assets'
              )}
            </button>
          ) : (
           
            // <div className={styles.generatedAssetsGrid}>
            //     {generatedAssets.map((asset, index) => (
            //         <div key={index} className={styles.assetCard}>
            //         <img src={asset} alt={`Generated asset ${index + 1}`} />
            //         <div className={styles.assetActions}>
            //             <button className={styles.downloadAssetButton}>Download</button>
            //         </div>
            //         <p className={styles.artworkStory}>
            //             {generatedStory.split('\n\n\ud83c\udfb5')[index] || ''}
            //         </p>
            //         </div>
            //     ))}
            // </div>
            <div className={styles.carouselContainer}>
                <Carousel indicators={true} controls={true}>
                {generatedAssets.map((asset, index) => (
                    <Carousel.Item key={index}>
                    <div className={styles.assetCard}>
                        <img src={asset} alt={`Generated asset ${index + 1}`} />
                        <div className={styles.assetActions}>
                        <button className={styles.downloadAssetButton}>Download</button>
                        </div>
                        <p className={styles.artworkStory}>
                        {generatedStory.split('\n\n\ud83c\udfb5')[index] || ''}
                        </p>
                    </div>
                    </Carousel.Item>
                ))}
                </Carousel>
            </div>

            
          )}
          
          <button 
            className={styles.backButton}
            onClick={() => setStep(1)}
          >
            Back to Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistMarketingPage;