import os
import torch
from PIL import Image
from transformers import Blip2Processor, Blip2ForConditionalGeneration
import openai
import dotenv

dotenv.load_dotenv()

# ==== Configuration ====
IMAGE_FOLDER = 'data/images'
CAPTION_FOLDER = 'data/captions'
os.makedirs(CAPTION_FOLDER, exist_ok=True)

openai.api_key = os.getenv("OPENAI_API_KEY")

# ==== Load BLIP-2 ====
device = "mps" if torch.backends.mps.is_available() else "cpu"
processor = Blip2Processor.from_pretrained("Salesforce/blip2-flan-t5-xl")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-flan-t5-xl",
    device_map={"": device}
)

# ==== Generate Detailed Caption ====
def generate_blip_caption(image: Image.Image) -> str:
    prompt = "Describe this image in a detailed, poetic, artistic style:"
    inputs = processor(images=image, text=prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=200)

    return processor.tokenizer.decode(output[0], skip_special_tokens=True)

# ==== Refine with GPT ====
def refine_with_gpt(basic_caption: str) -> str:
    prompt = (
        f"The following is a caption of an image: \"{basic_caption}\".\n"
        "Rewrite it in a more artistic, metaphorical, and collage-style voice. "
        "The new version should feel expressive and layered with meaning, like a dream sequence or a story told through fragments.\n"
    )
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9
    )
    return response['choices'][0]['message']['content'].strip()

# ==== Main Loop ====

def main():
    for filename in os.listdir(IMAGE_FOLDER):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        image_path = os.path.join(IMAGE_FOLDER, filename)
        caption_path = os.path.join(CAPTION_FOLDER, f"{os.path.splitext(filename)[0]}.txt")

        print(f"Processing {filename}...")
        image = Image.open(image_path).convert("RGB")

        try:
            basic_caption = generate_blip_caption(image)
            print(f'\nGenerated caption for image {filename}:')
            print(f'\n {basic_caption}')
            # refined_caption = refine_with_gpt(basic_caption)

            with open(caption_path, "w", encoding="utf-8") as f:
                f.write(basic_caption)

            print(f"✅ Saved caption: {caption_path}")
        except Exception as e:
            print(f"⚠️ Failed to process {filename}: {e}")

if __name__=="__main__":
    main()
