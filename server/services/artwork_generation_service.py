import openai
import dotenv
from .lyrics_service import LyricsService
import textwrap
import os
import replicate

dotenv.load_dotenv()
class ArtworkGenerationService():
    def __init__(self):
        self.lyrics_service = LyricsService()
        openai.api_key = os.getenv("OPENAI_API_KEY")


    def generate_sonic_story(self, song_lyrics_dict: dict, model="gpt-4o-mini") -> str:
        """
        Takes a dict like {"song_name": "lyrics"} and returns a single caption/story 
        that captures the sonic identity of the given songs using GPT.
        """
        # Build a structured input block from the lyrics
        song_blocks = []
        for name, lyrics in song_lyrics_dict.items():
            clean_lyrics = lyrics.strip().replace("\n", " ")
            song_blocks.append(f"• **{name}**:\n{textwrap.shorten(clean_lyrics, width=800, placeholder='...')}")
        
        combined_input = "\n\n".join(song_blocks)

        # Prompt engineering
        system_prompt = (
            "You are an expert music critic and visual storyteller. Given the lyrics of multiple songs, "
            "your job is to synthesize their emotional and thematic essence into one cohesive story. "
            "This story should capture the sonic identity and artistic world these tracks build together. "
            "Your output will be used to generate a visual representation of this musical journey using an AI image model. "
            "Be poetic, evocative, and imaginative—but keep it grounded in the emotional tone and recurring symbols in the lyrics."
        )

        user_prompt = (
            f"Here are the lyrics of several songs:\n\n{combined_input}\n\n"
            "Now, based on all of these lyrics, write a single short story or paragraph (max 200 words) "
            "that captures their collective mood, themes, and emotional landscape. "
            "Avoid naming the songs or artists. Focus on imagery and emotion."
        )

        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=350,
            )
            story = response["choices"][0]["message"]["content"].strip()
            return story
        
        except Exception as e:
            print(f"Error generating story: {e}")
            return ""

    def generate_image_prompt(self, story, model="gpt-4o-mini"):
        """
        Generates an optimized image prompt from the sonic story.
        """
        system_prompt = (
            "You are an expert at creating prompts for AI image generation. "
            "Given a story told by a song create a detailed, vivid image prompt "
            "that would generate a beautiful album cover or concert poster that captures the essence of the story. "
            "Your prompt should be detailed and specific about style, mood, colors, and imagery. "
            "DO NOT include any artist names, copyrighted characters, or specific people. "
            "Focus on creating an original artistic vision that represents the music's feeling."
        )

        user_prompt = (
            f"Here is a story summarizing someone's musical taste and identity:\n\n{story}\n\n"
            "Create a detailed image prompt suitable for Stable Diffusion XL that would generate "
            "a visual representation of this musical identity in a collage format mixing pop art and surreal elements. "
            "The prompt should be 1-3 sentences and highly visual, focusing on style, composition, colors, and mood. "
            "Include artistic direction like photography style, painting technique, etc."
        )

        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=200,
            )
            prompt = response["choices"][0]["message"]["content"].strip()
            return prompt
        
        except Exception as e:
            print(f"Error generating image prompt: {e}")
            return "A vibrant, emotional album cover representing diverse musical influences"


    def generate_artwork_with_sdxl(self, prompt, output_path="static/artwork"):
        """
        Generates artwork using Stability AI's API (image/* stream response version)
        """
        import requests
        import os
        import uuid
        from datetime import datetime

        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        output_file = f"{output_path}/artwork_{timestamp}_{unique_id}.webp"

        # API Key & Endpoint
        api_key = os.getenv("STABILITY_API_KEY")
        if not api_key:
            raise ValueError("Missing Stability API key")

        url = "https://api.stability.ai/v2beta/stable-image/generate/core"

        # Prompt with negative conditioning
        positive_prompt = prompt
        negative_prompt = (
            "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, "
            "extra limb, missing limb, floating limbs, disconnected limbs, mutation, "
            "mutated, ugly, disgusting, blurry, amputation, text, watermark, signature"
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "image/*"
        }

        data = {
            "prompt": f"{positive_prompt} --no {negative_prompt}",
            "output_format": "webp",
            "height": 1024,
            "width": 1024,
            "steps": 50,
            "cfg_scale": 7.5,
        }

        try:
            response = requests.post(
                url,
                headers=headers,
                data=data,
                files={"none": ''},  # Required per Stability's API structure
            )

            if response.status_code == 200:
                # return response.content
                with open(output_file, 'wb') as file:
                    file.write(response.content)
                return output_file
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"❌ Exception while generating artwork: {e}")
            return None

    def generate_artwork_for_listener(self, payload):
        # Step 1: Extract the top tracks
        userData = payload.get('userData', '')
        topTracks = userData.get('topTracks', '')
        selectedModel = payload.get('selectedModel', '')

        # Step 2: get the lyrics for each song from the genius api service 
        # Step 2: ensure that you are handling errors where the response is null 
        custom_dict = {}

        for track in topTracks[:5]:
            track_name = track.get('name', '')
            artists = track.get('artists', '')
            artist_name = artists[0].get('name', '') # only use the first artist featured
            
            lyrics = self.lyrics_service.get_lyrics_with_retry(artist_name, track_name)
        
            if lyrics:
                clean_lyrics = self.lyrics_service.clean_lyrics(lyrics)
                custom_dict[f'{track_name} - {artist_name}'] = clean_lyrics

            else:
                print("No lyrics found for this song.")
                custom_dict[f'{track_name} - {artist_name}'] = "No Lyrics Found Online"
        
    
        # Step 3: call gpt to process all the lyrics 
        custom_user_story = self.generate_sonic_story(custom_dict)
        print(f'\nCustom user story = {custom_user_story}')

        
        # Step 4: Generate a prompt for the image model based on the story
        image_prompt = self.generate_image_prompt(custom_user_story)
        
        # Step 4 (for later: feed the user's profile picture)
        
        # Step 5: Generate the artwork using Stable Diffusion XL
        if selectedModel == 'Base model sdxl':
            print('\nGENERATING WITH BASE MODEL')
            generated_image_path = self.generate_artwork_with_sdxl(image_prompt)
        
        else:
            print('\nGENERATING WITH FINETUNED MODEL')
            generated_image_path = self.generate_artwork_with_replicate(image_prompt)

        # Step 5.1: encode the binary image data to base64 
        if generated_image_path:
            import os
            filename = os.path.basename(generated_image_path)
            image_url = f"http://54.164.2.161:5000/static/artwork/{filename}"

        # Step 6: return the image url and customer user story
        print(f'\nimage_prompt generated = {image_prompt}')
        return image_url, custom_user_story

    def generate_artwork_with_replicate(self, prompt, output_path="static/artwork"):
        """
        Generates artwork using your fine-tuned LoRA model via Replicate
        """
        import replicate
        import os
        import uuid
        from datetime import datetime
        import requests

        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        output_file = f"{output_path}/artwork_{timestamp}_{unique_id}.webp"
        
        try:
            output = replicate.run(
                    "ahmed-boutar/fine-tuned-sd-sxl:4a63ea928c0e337f0f440c4ef71e66e3952d33c4e9abbce2178abf221813df72",
                    input={
                        "prompt": prompt,
                        "width": 1024,
                        "height": 1024,
                        "guidance_scale": 7.5,
                        "negative_prompt": "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation",
                        "num_inference_steps": 50
                    }
                )
            
            # Download the image
            if output:
                image_url = output
                img_response = requests.get(image_url)
                
                if img_response.status_code == 200:
                    with open(output_file, 'wb') as file:
                        file.write(img_response.content)
                    return output_file
            
            return None

        except Exception as e:
            print(f"❌ Exception while generating artwork: {e}")
            return None

    def generate_marketing_for_artists(self, payload):
        import base64

        form_data = payload.get('formData', {})
        album_title = form_data.get('albumTitle', 'Untitled')
        artist_name = form_data.get('artistName', 'Unknown Artist')
        genre = form_data.get('genre', 'Music')
        description = form_data.get('description', '')
        song_details = form_data.get('songDetails', [])
        selectedModel = form_data.get('selectedModel', '')

        # 1. Prepare all lyrics with titles
        songs = [(song['title'], song['lyricsAndDescription']) for song in song_details]

        # 2. Generate a cohesive album story: one short story per song with connecting flow
        full_story = ""
        per_song_stories = []
        previous_summary = ""

        for idx, (title, lyrics_block) in enumerate(songs):
            clean_lyrics = lyrics_block.replace("Lyrics:", "").strip()

            # Build prompt for each song in the context of the whole album
            story_prompt = (
                f"Album title: {album_title}\n"
                f"Artist: {artist_name}\n"
                f"Genre: {genre}\n"
                f"Description: {description}\n"
                f"Song Title: {title}\n"
                f"Lyrics:\n{clean_lyrics}\n\n"
            )

            if idx == 0:
                story_prompt += (
                    "Start the story of the album here. This is the first track, so set the tone. "
                    "Write a short story or paragraph (around 150 words) that captures the emotional essence of the lyrics "
                    "and begins a poetic journey through the album. Be evocative and cinematic."
                )
            else:
                story_prompt += (
                    f"Continue the narrative from the previous song. "
                    f"Here’s a summary of what has happened so far: {previous_summary}\n"
                    "Now write a short continuation of the story (~150 words) that aligns with the themes in this song’s lyrics. "
                    "Keep the emotional tone and motifs consistent with the ongoing journey."
                )

            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a poetic storyteller creating a connected story based on the songs of a concept album."},
                        {"role": "user", "content": story_prompt},
                    ],
                    temperature=0.7,
                    max_tokens=300,
                )

                story_segment = response["choices"][0]["message"]["content"].strip()
                per_song_stories.append(story_segment)
                full_story += f"\n\n🎵 *{title}*\n{story_segment}"
                previous_summary = story_segment

            except Exception as e:
                print(f"Error generating story for {title}: {e}")
                per_song_stories.append("")

        # 3. For each story segment, generate image prompt and artwork
        image_urls = []
        for story_segment in per_song_stories:
            image_prompt = self.generate_image_prompt(story_segment)
            if selectedModel == 'Base model sdxl':
                print('\nGENERATING WITH BASE MODEL')
                image_path = self.generate_artwork_with_sdxl(image_prompt)
            else:
                print('\nGENERATING WITH FINETUNED MODEL')
                image_path = self.generate_artwork_with_replicate(image_prompt)

            if image_path:
                filename = os.path.basename(image_path)
                image_url = f"http://54.164.2.161:5000/static/artwork/{filename}"
                image_urls.append(image_url)
            else:
                image_urls.append("")

        return full_story.strip(), image_urls

