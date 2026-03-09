from sentence_transformers import SentenceTransformer, util
import numpy as np

class SbertMatcher:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        # Lazy loading could be done, but for now we load in init
        # This downloads the model on first run
        print(f"Loading SBERT model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        print("SBERT model loaded.")

    def calculate_similarity(self, text1, text2):
        """
        Computes cosine similarity between two texts.
        Returns a score between 0.0 and 1.0 (or higher if range differs, usually -1 to 1).
        We clamp to 0-1 for suitability.
        """
        if not text1 or not text2:
            return 0.0
            
        # Encode
        embedding1 = self.model.encode(text1, convert_to_tensor=True)
        embedding2 = self.model.encode(text2, convert_to_tensor=True)
        
        # Compute cosine similarity
        cosine_score = util.cos_sim(embedding1, embedding2)
        
        # Extract scalar
        score = cosine_score.item()
        
        # Ensure it's 0-1 (text similarity shouldn't be negative usually unless opposite meaning, 
        # but for CV/JD usually it's positive).
        return max(0.0, min(1.0, score))

matcher_instance = None

def get_matcher():
    global matcher_instance
    if matcher_instance is None:
        matcher_instance = SbertMatcher()
    return matcher_instance
