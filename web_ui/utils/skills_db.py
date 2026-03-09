
# A comprehensive list of technical skills for keyword matching
COMMON_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "r", "matlab", "scala", "perl",
    
    # Web Development
    "html", "css", "html5", "css3", "react", "react.js", "angular", "vue", "vue.js", "node.js", "express", "django", "flask", "fastapi", "spring", "spring boot", "asp.net", "laravel", "jquery", "bootstrap", "tailwind",
    
    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "nosql", "redis", "oracle", "sqlite", "cassandra", "dynamodb", "firebase", "mariadb",
    
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "google cloud", "gcp", "docker", "kubernetes", "k8s", "jenkins", "gitlab ci", "github actions", "circleci", "terraform", "ansible", "nginx", "apache", "linux", "unix", "bash", "shell scripting",
    
    # AI/ML/Data
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "opencv", "spacy", "nltk", "hugging face", "transformers", "llm", "generative ai", "sbert", "bert",
    
    # Tools & Others
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "agile", "scrum", "kanban", "rest api", "graphql", "soap", "websocket", "microservices", "serverless", "testing", "junit", "pytest", "selenium", "cypress",
}

def extract_skills_from_text(text):
    """
    Simple keyword-based extraction (case-insensitive).
    Returns a set of found skills.
    """
    text_lower = text.lower()
    found_skills = set()
    
    # Basic word boundary check to avoid substring matches (e.g., "go" in "good")
    import re
    
    for skill in COMMON_SKILLS:
        # Escape skill for regex, and add boundary checks
        # \b matches word boundary
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
            
    return found_skills
