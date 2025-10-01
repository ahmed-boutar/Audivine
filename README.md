# Audivine

## Overview
Audivine transforms your Spotify listening habits and song lyrics into unique, collage-style visual artwork. Whether you're a listener or an artist, Audivine helps turn musical identity into a powerful visual storytelling tool. For artists, it generates marketing content from album artwork, lyrics, and other metadata—creating a visual narrative for each song.

## Project Structure 
```
├── client/                         # Frontend code 
├── sample_data/
│   ├── captions/                   # sample image captions
│   └── images/                     # sample images for training
├── scripts/
│   ├── caption_generator.py        # Caption generation from images using BLIP and GPT
│   ├── cog.yaml                    # Cog configuration for Replicate model deployment
│   ├── FineTuningStableDiffusionSXL.ipynb  # Notebook for SDXL fine-tuning used in Colab
│   ├── predict.py                  # Run predictions using trained models used in Replicate
│   └── train_dreambooth_lora_sdxl.py # fine-tuning SDXL with DreamBooth + LoRA from HF repo
├── server/
│   ├── models/                     # Trained models and weights
│   └── static/artwork/                # Stores generated artwork assets
│   └── utils/                         # Utility functions/helpers
│   └── venv/                          # Python virtual environment
│   └── .env                           # Environment variables (API keys, etc.)                 
│   └── app.py                         # Flask/FastAPI main application entry
│   └── services/
│       ├── artwork_generation_service.py  # Core artwork generation logic
│       ├── genius_service.py      # Interfaces with Genius API for lyrics
│       ├── lyrics_service.py      # Central lyrics handling logic
│       └── spotify_service.py     # Connects to Spotify API for track data
├── README.md                      
└── requirements.txt               # Python dependencies
├── .gitignore   

```

## How To Run 
1. Clone Repo
2. `cd Audivine/client`
3. `npm install`
4. Paste the .env.local in the `Audivine/client` folder
5. `npm run dev`

Note: The backend requires to be deployed to be run. Inference is done on a GPU, and takes forever on a CPU. 
## Problem Addressed
As a music producer, I struggled to promote my first EP, released in July 2023. Despite the excitement of finishing it, I felt overwhelmed by the marketing process, unsure where to start or what story to share. Traditional advice focused on telling the story behind the music, but translating that into visuals was challenging.

Audivine was born out of this frustration. By analyzing lyrics and album descriptions, it generates a narrative for each song and creates collage-style visuals that reflect those stories. This gives artists a starting point—or even a finished product—for marketing their music.

After sharing the concept, friends encouraged me to expand the tool. I added a feature that generates personalized artwork from a user's top 5 most-played songs on Spotify.

## Data Sources 
Since I wanted to generate images in a distinctive style that I like, I had to collect the training data manually. Since the goal was to use a text-to-image model, I also had to pair each image with a caption. 

### Collecting Images 
To create a fine-tuned model with a distinct collage aesthetic, I manually curated training images from Unsplash, which allows free use of visuals for commercial purposes (Source: [Unsplash Terms & Conditions (<https://unsplash.com/license>). I carefully selected images that I liked, tagged as “collage-style” and downloaded them. A few examples are included under `sample_data/`

### Captioning 
Initial captions were generated using the BLIP model, but it struggled with complex visuals. I rewrote the captions manually, then used GPT-4o-mini to refine them for coherence and style. The final dataset consisted of 105 image–caption pairs.

## Review of relevant efforts
This dataset is a new dataset that I created myself. No previous work was done on it.

## Modeling Approach 
Since my work is based on image generation, I decided to go with a Stable Diffusion model. To be specific, I used the Stable Diffusion XL model ("stabilityai/stable-diffusion-xl-base-1.0")

### Naive Model 
I first used the Stable Diffusion XL base model via Stability AI’s API. Since the API no longer supports version 1.0 directly, I used the latest supported version at stability.ai/v2beta, which provided comparable results.

### Traditional Approach
Given the goal of this project is to leverage an image generation model, it did not make sense to go with a traditional approach. I thought about using BoW to generate the song's story given its lyrics, but it felt like a waste of money since the image generation costs money. GenAI is a very recent technology and no viable traditional approaches exist for image generation. Neural networks are leveraged in ingenious ways to make image generation possible. The nature of traiditonal models (discriminative) makes it impossible to accomplish this task. 

### Deep Learning Approach 
I fine-tuned stable-diffusion-xl-base-1.0 using the DreamBooth + LoRA approach. The training script was adapted from [Hugging Face’s official example](<https://raw.githubusercontent.com/huggingface/diffusers/main/examples/dreambooth/train_dreambooth_lora_sdxl.py>). Due to incompatibilities with local dataset formats, I modified the script to support offline training. Fine-tuning was done on Google Colab (A100 GPU) over 3000 epochs (~4 hours).

## System Architecture 
The front end was built using React + Vite + Typescript + Bootstrap. The backend is hosted on an EC2 instance and receives data through a web socket. The fine-tuned model is hosted on Replicate, while the naive model is used through StabilityAI's API. 

## Model Evaluation Process & Metric Selection 
The evaluation of genAI models is tricky. We can't really use precision and accuracy. And since the dataset is based on images that I personally like, the evaluation is very subjective. The evaluation strategy here involved 3 main aspects:
1) I generated visuals using both models for various inputs. The fine-tuned model produced artwork with noticeably more collage-like features and distinct styling (although not much meaning is packed into them)
2) I asked 10 friends and family members if they are able to notice a significant styling different between the naive and deep learning model, while rating the difference on a scale of 1-5, where 5 is extremely different style. The average of all responses was 4.2, indicating an overral significant stylistic difference.
3) I used latency as my last evaluation metric. The naive model averaged 5.8 seconds of waiting for each image generated (10 tries), while the deep learning model averages ~11 seconds of waiting for each image generated (10 tries). While the difference is significant, it is important to note that Stability AI's models are optimized for inference since it's a commercial product. While Replicate is also a commercial product, not much optimization was applied to the fine-tuned model. Furthermore, Replicate always takes some time to boot up the model's instance given that I am not paying for the extra service of keeping the model running.

## Data Processing Pipeline 

### For Training
Since I ensured that the images are high quality and that the caption are under 200 words, preprocessing was not necessary for training. Furthremore, the script downloaded from the hugging face repo contained some preprocessing code that I just utilized.

### For Inference 
For Listeners:
- Extract top 5 songs and artist names.
- Retrieve lyrics via LyricsOVH API (was initially using Genius API, but when I switched my scripts to EC2 instance, it stopped working)
- Use GPT-4o-mini to summarize each song’s narrative.
- Use GPT-4o-mini again to generate image prompts.
- Send prompts to the model (via Replicate or Stability AI).
- Stream generated images to frontend once complete.

For Artists:
- Similar process as above, using lyrics, album artwork, and form inputs to create prompts
- Prompts are tuned to reflect marketing intent

NOTE: For inference and training, we include negative prompts to the model, which are subjects/topics/concepts that should be avoided. In Audivine's case, the negative prompts include violence, torture, and anything violent or perceived as negative by most people
## Model Selected 
The fine-tuned model is the clear choice. It produces images with the intended collage aesthetic and performs significantly better in stylistic alignment and subjective quality, despite higher latency.

## Demo 
[PROJECT DEMO](<https://www.youtube.com/watch?v=rEpEPMttce0>)

## Ethics statement
Audivine was built with respect for intellectual property and user privacy. All training images were sourced legally from Unsplash with proper attribution practices. User listening data is handled responsibly and never stored beyond session scope. The generated artwork is intended for personal use or artist promotion, not resale.

