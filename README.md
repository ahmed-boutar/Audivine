# Audivine

## Description
Audivine creates unique artwork from your Spotify listening habits, turning your musical identity into a visual experience. For artists, generates marketing content given the album cover, lyrics of songs (in English), and any other relevant information. The marketing content consists of collage-style images for each song that aim to represent the story told in the song.

## Problem Addressed
As a music producer, I have always found it hard to work on marketing content or at least find inspiration for it. When I finsihed producing my first EP (mini album) in July 2023, I was ecstatic. However, when I realized the amount of work left when it comes to marketing it and getting the music out there. I really struggled to get anything out there. I was very confused on what to include and how to work on each song. When I looked online, suggestions included talking about the story the album came from or to share the process. Since I was deeply connected to the story I was sharing in my work, I wanted to share it with others, but did not know how or where to start from. With the tools I have under my belt after learning so much in this program, I realized creating a tool that would have allowed me to get past the hurdle. By analyzing the song lyrics and album description, Audivine provides a story for each song (and links together) and provides generated images in a collage-like style (which recently has been my favorite style since you can pack a lot of meaning) for each song, which can be either used as is or can at least help to get started with creating marketing content. 
As I was working on it, some friends mentioned that I could potentially turn this into a profitable project. I added a feature that generates an image in a collage-like style given their top-5 listened songs. 

## Data Sources 
Since I wanted to generate images in a distinctive style that I like, I had to collect the training data manually. Since the goal was to use a text-to-image model, I also had to pair each image with a caption. 

### Collecting Images 
The images I had in mind are in a collage-style (I included a few examples under `data/`). I looked into Unsplash.com, which is a platform for sharing images copy-rightfree. In fact, "Unsplash visuals are made to be used freely. All images can be downloaded and used for free". Permission is not needed for commercial purposes as long as the images are not sold without significant modifications, and that the images are not used to replicate the Unsplash service (Source: [Unsplash Terms & Conditions (<https://unsplash.com/license>). I picked images that I like by looking at "collage-style" tagged images. 

### Captioning 
For each image downloaded, I generated a caption using a BLIP model, which I then fed into GPT-4o-mini. Given that the results were atroceous since BLIP is not able to generate meaningful captions for images that are quite complex in nature. Therefore, I did it manually. I wrote my own caption and labeled it then I run the captions through GPT to get a more cohesive caption. 

At the end, I had a collection of 105 image-caption pairs as my training data.

## Review of relevant efforts
This dataset is a new dataset that I created myself. No previous work was done on this dataset.

## Modeling Approach 
Since my work is based on image generation, I decided to go with a Stable Diffusion model. To be specific, I used the Stable Diffusion XL model ("stabilityai/stable-diffusion-xl-base-1.0")

### Naive Model 
For the naive model, I used the pre-trained base stable diffusion XL model. However, since the EC2 instance I am using does not have GPU and the ones with GPUs are quite expensive, I used the pre-trained model through stabilityai's api. Since Stability AI's api has been updated, there was no support for the stable-diffusion-xl-base-1.0. Therefore, I used the next version of the model (found at https://api.stability.ai/v2beta/stable-image/). I assumed that the performance would be similar (which it was). 

### Traditional Approach
Given the goal of this project is to leverage an image generation model, it did not make sense to go with a traditional approach. I thought about using BoW to generate the song's story given its lyrics, but it felt like a waste of money since the image generation costs money. GenAI is a very recent technology and no viable approaches exist for image generation. Neural networks are leveraged in ingenious way to make image generation possible. The nature of other models (discriminative) makes it impossible to accomplish this task. 

### Deep Learning Approach 
For the deep learning approach, I used the dataset I created to fine-tune the stable-diffusion-xl-base-1.0 model. To do that, I used 
Your model evaluation process & metric selection
Your modeling approach
Data processing pipeline
Models evaluated and model selected (must include at least 1 non deep learning model and 1 deep learning model - see details above)
Comparison to naive approach
Brief demo of your project
Results and conclusions
Ethics statement
Demo Day "Pitch" (maximu
# Notes 



Audivine meets all these conditions
