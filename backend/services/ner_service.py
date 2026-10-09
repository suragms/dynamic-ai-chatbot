import re
import spacy

class NERService:
    """
    Named Entity Recognition Service.
    Extracts entities (PERSON, ORG, GPE, DATE, TIME, MONEY, PRODUCT, EVENT) using spaCy
    or regex/rule-based fallback.
    """

    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("[+] Loaded spaCy 'en_core_web_sm' model for NER.")
        except Exception:
            try:
                # Fallback download attempt
                spacy.cli.download("en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
            except Exception:
                print("[!] spaCy model 'en_core_web_sm' not installed. Using rule-based fallback NER.")
                self.nlp = None

    def extract_entities(self, text: str) -> list[dict]:
        """
        Extract named entities from text.
        Returns: list of dicts with keys: entity, entity_type, start, end
        """
        if not text:
            return []

        if self.nlp:
            doc = self.nlp(text)
            entities = []
            target_labels = {"PERSON", "ORG", "GPE", "DATE", "TIME", "MONEY", "PRODUCT", "EVENT"}
            for ent in doc.ents:
                if ent.label_ in target_labels:
                    entities.append({
                        "entity": ent.text,
                        "entity_type": ent.label_,
                        "start": ent.start_char,
                        "end": ent.end_char,
                        "text": ent.text,
                        "label": ent.label_
                    })
            return entities

        # Rule-based regex fallback for basic entity recognition
        entities = []
        # Dates (e.g. today, tomorrow, yesterday, Monday, 2026-10-08)
        date_pattern = re.compile(r"\b(today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.I)
        for match in date_pattern.finditer(text):
            entities.append({
                "entity": match.group(0),
                "entity_type": "DATE",
                "start": match.start(),
                "end": match.end(),
                "text": match.group(0),
                "label": "DATE"
            })

        # Capitalized Words likely to be PERSON or GPE/ORG
        words = text.split()
        current_pos = 0
        for i, word in enumerate(words):
            word_pos = text.find(word, current_pos)
            clean_w = re.sub(r"[^\w]", "", word)
            if clean_w and clean_w[0].isupper() and i > 0 and clean_w.lower() not in {"the", "a", "an", "i", "what", "how", "why"}:
                start_idx = word_pos
                end_idx = word_pos + len(word)
                entities.append({
                    "entity": clean_w,
                    "entity_type": "PERSON",
                    "start": start_idx,
                    "end": end_idx,
                    "text": clean_w,
                    "label": "PERSON"
                })
            current_pos = word_pos + len(word) if word_pos != -1 else current_pos

        return entities

ner_service = NERService()
