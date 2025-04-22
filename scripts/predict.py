import os
import sys
from typing import List
import torch
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline
from diffusers.loaders import LoraLoaderMixin
from cog import BasePredictor, Input, Path

class Predictor(BasePredictor):
    def setup(self):
        """Load the model into memory"""
        print("Loading pipeline...")
        
        # Determine if we're using SDXL or SD 1.5 (adjust base model as needed)
        base_model_id = "stabilityai/stable-diffusion-xl-base-1.0"  # or "runwayml/stable-diffusion-v1-5"
        
        # Load the base model
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            base_model_id,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        
        # Load your LoRA weights
        self.pipe.load_lora_weights("./", weight_name="pytorch_lora_weights.safetensors")
        
        # Move to GPU
        self.pipe = self.pipe.to("cuda")
    
    def predict(
        self,
        prompt: str = Input(description="Prompt for image generation"),
        negative_prompt: str = Input(
            description="Negative prompt", 
            default="deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation"
        ),
        width: int = Input(description="Image width", default=1024),
        height: int = Input(description="Image height", default=1024),
        num_inference_steps: int = Input(description="Number of diffusion steps", default=50),
        guidance_scale: float = Input(description="Guidance scale", default=7.5),
        seed: int = Input(description="Random seed", default=None),
    ) -> Path:
        """Run a single prediction on the model"""
        if seed is not None:
            generator = torch.Generator("cuda").manual_seed(seed)
        else:
            generator = None
            
        image = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            height=height,
            width=width,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            generator=generator,
        ).images[0]
        
        output_path = "output.png"
        image.save(output_path)
        
        return Path(output_path)