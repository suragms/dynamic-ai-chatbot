import { useState, useEffect, useCallback } from 'react';

export function useVoice(onTranscript?: (text: string) => void, language: string = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSpeechSupported =
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSupported(!!isSpeechSupported);
    }
  }, []);

  const getLangCode = (lang: string) => {
    if (lang === 'hi' || lang === 'hinglish') return 'hi-IN';
    return 'en-US';
  };

  const toggleListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setError('Speech Recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setError(null);
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLangCode(language);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && onTranscript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please try speaking again.');
        } else if (event.error === 'service-not-allowed') {
          setError('Speech recognition service is not allowed by your browser.');
        } else {
          setError(`Voice input issue: ${event.error || 'Unable to capture audio.'}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start error:', err);
      setIsListening(false);
      setError('Voice recognition is currently unavailable in this environment.');
    }
  }, [isListening, language, onTranscript]);

  const speak = useCallback((text: string, speakLang: string = language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = getLangCode(speakLang);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    supported,
    error,
    setError,
    toggleListening,
    speak,
    stopSpeaking,
  };
}
