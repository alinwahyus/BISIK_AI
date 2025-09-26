// BISIK AI - Accessibility Communication Platform
// JavaScript for handling speech recognition, text-to-speech, and UI interactions

import { aiService } from './config.js';
import SimpleAnimation from './simple-animation.js';


class AccessibilityPlatform {
    constructor() {
        this.currentMode = 'split'; // Always in split mode now
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isRecording = false;
        this.messages = { deaf: [], blind: [] };
        this.cameraStream = null;
        this.isTranslating = false;
        this.detectionInterval = null;
        this.handDetectionActive = false;
        
        // Initialize Simple Animation system
        this.simpleAnimation = new SimpleAnimation();
        
        // Make app globally accessible for deaf mode integration
        window.bisikApp = this;
        
        this.initializeEventListeners();
        this.setupAccessibilityFeatures();
        this.initializeAIServices();
    }

    initializeAIServices() {
        console.log('Initializing BytePlus AI Services...');
        this.updateStatus('deaf', 'AI Services Ready', 'ready');
        this.updateStatus('blind', 'AI Services Ready', 'ready');
    }

    initializeEventListeners() {
        // Deaf Mode Event Listeners
        const sendTextBtn = document.getElementById('send-text-btn');
        const speakTextBtn = document.getElementById('speak-text-btn');
        const startCameraBtn = document.getElementById('start-camera-btn');
        const translateBisindoBtn = document.getElementById('translate-bisindo-btn');
        const deafTextInput = document.getElementById('deaf-text-input');

        // Blind Mode Event Listeners
        const startRecordingBtn = document.getElementById('start-recording-btn');
        const stopRecordingBtn = document.getElementById('stop-recording-btn');
        const playMessageBtn = document.getElementById('play-message-btn');
        const translateToBisindoBtn = document.getElementById('translate-to-bisindo-btn');
        const aiEnhanceBtn = document.getElementById('ai-enhance-btn');

        // Deaf Mode Events
        if (sendTextBtn) {
            sendTextBtn.addEventListener('click', () => this.sendTextMessage());
        }
        
        if (speakTextBtn) {
            speakTextBtn.addEventListener('click', () => this.speakLastMessage());
        }
        
        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => this.toggleCamera());
        }
        
        if (translateBisindoBtn) {
            translateBisindoBtn.addEventListener('click', () => this.translateBisindoToText());
        }
        
        if (deafTextInput) {
            deafTextInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendTextMessage();
                }
            });
        }

        // Blind Mode Events
        if (startRecordingBtn) {
            startRecordingBtn.addEventListener('click', () => this.startVoiceRecording());
        }
        
        if (stopRecordingBtn) {
            stopRecordingBtn.addEventListener('click', () => this.stopVoiceRecording());
        }
        
        if (playMessageBtn) {
            playMessageBtn.addEventListener('click', () => this.playLastMessage());
        }
        
        if (translateToBisindoBtn) {
            translateToBisindoBtn.addEventListener('click', () => this.translateToBisindo());
        }
        
        // AI Enhance button disabled
        // if (aiEnhanceBtn) {
        //     aiEnhanceBtn.addEventListener('click', () => this.enhanceWithAI());
        // }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.setupAccessibilityFeatures();
        this.announcePageLoad();
    }

    announcePageLoad() {
        // Announce page load for screen readers
        setTimeout(() => {
            this.speak("Platform komunikasi aksesibilitas BISIK AI telah dimuat. Pilih mode komunikasi Anda.");
        }, 1000);
    }

    setupEventListeners() {
        // Mode selection
        document.getElementById('deaf-mode').addEventListener('click', () => this.selectMode('deaf'));
        document.getElementById('blind-mode').addEventListener('click', () => this.selectMode('blind'));

        // Keyboard navigation for mode selection
        document.getElementById('deaf-mode').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectMode('deaf');
            }
        });

        document.getElementById('blind-mode').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectMode('blind');
            }
        });

        // Deaf mode controls
        document.getElementById('send-text-btn').addEventListener('click', () => this.sendTextMessage());
        document.getElementById('speak-text-btn').addEventListener('click', () => this.speakLastMessage());
        document.getElementById('deaf-text-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });

        // Blind mode controls
        document.getElementById('start-recording-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('stop-recording-btn').addEventListener('click', () => this.stopRecording());
        document.getElementById('play-message-btn').addEventListener('click', () => this.playLastMessage());

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.selectMode('deaf');
                        break;
                    case '2':
                        e.preventDefault();
                        this.selectMode('blind');
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.currentMode === 'blind') {
                            this.toggleRecording();
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        if (this.currentMode === 'deaf') {
                            this.speakLastMessage();
                        } else if (this.currentMode === 'blind') {
                            this.playLastMessage();
                        }
                        break;
                }
            }
        });
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'id-ID';
            
            this.recognition.onstart = () => {
                this.updateStatus('blind', 'Mendengarkan...', true);
                this.isRecording = true;
                document.getElementById('start-recording-btn').disabled = true;
                document.getElementById('stop-recording-btn').disabled = false;
            };
            
            this.recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                
                try {
                    // AI Enhancement disabled - using original transcript
                    // const enhancedMessage = await aiService.enhanceWithNLP(transcript);
                    
                    // Add to blind panel with audio source
                    this.addMessage('blind', transcript, 'sent', 'audio');
                    
                    // Send to deaf panel with audio source (using original transcript)
                    this.addMessage('deaf', transcript, 'received', 'audio');
                    
                    // Translate to BISINDO (only for audio input, using original transcript)
                    const bisindoTranslation = await aiService.translateToBisindo(transcript);
                    this.displayBisindo('bisindo-output', bisindoTranslation);
                    
                    this.updateStatus('blind', 'Pesan terkirim', 'ready');
                    
                } catch (error) {
                    console.error('Speech processing error:', error);
                    this.addMessage('blind', transcript, 'sent', 'audio');
                    this.addMessage('deaf', transcript, 'received', 'audio');
                    this.updateStatus('blind', 'Error pemrosesan AI', 'error');
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateStatus('blind', 'Error pengenalan suara', 'error');
                this.isRecording = false;
                
                const startBtn = document.getElementById('start-recording-btn');
                const stopBtn = document.getElementById('stop-recording-btn');
                
                if (startBtn) startBtn.disabled = false;
                if (stopBtn) stopBtn.disabled = true;
            };
            
            this.recognition.onend = () => {
                this.updateStatus('blind', 'Siap merekam suara', false);
                this.isRecording = false;
                this.resetRecordingButtons();
            };
        } else {
            console.warn('Speech recognition not supported');
            this.updateStatus('blind', 'Speech recognition tidak didukung browser ini', false);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: Send message (deaf mode)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            this.sendTextMessage();
        }
        
        // Ctrl/Cmd + R: Start/Stop recording (blind mode)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (this.isRecording) {
                this.stopVoiceRecording();
            } else {
                this.startVoiceRecording();
            }
        }
        
        // Ctrl/Cmd + S: Speak last message
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.speakLastMessage();
        }
        
        // Ctrl/Cmd + C: Toggle camera
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            this.toggleCamera();
        }
        
        // Ctrl/Cmd + B: Translate to BISINDO
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.translateToBisindo();
        }
        
        // AI Enhancement keyboard shortcut disabled
        // Ctrl/Cmd + A: AI Enhancement
        // if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        //     e.preventDefault();
        //     this.enhanceWithAI();
        // }
    }

    setupAccessibilityFeatures() {
        // High contrast mode
        const toggleHighContrast = () => {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('high-contrast', document.body.classList.contains('high-contrast'));
        };

        // Reduced motion
        const toggleReducedMotion = () => {
            document.body.classList.toggle('reduced-motion');
            localStorage.setItem('reduced-motion', document.body.classList.contains('reduced-motion'));
        };

        // Load saved preferences
        if (localStorage.getItem('high-contrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
        
        if (localStorage.getItem('reduced-motion') === 'true') {
            document.body.classList.add('reduced-motion');
        }

        // Add keyboard shortcuts info
        console.log('Keyboard Shortcuts:');
        console.log('Ctrl/Cmd + Enter: Send message');
        console.log('Ctrl/Cmd + R: Start/Stop recording');
        console.log('Ctrl/Cmd + S: Speak last message');
        console.log('Ctrl/Cmd + C: Toggle camera');
        console.log('Ctrl/Cmd + B: Translate to BISINDO');
        console.log('Ctrl/Cmd + A: AI Enhancement');
    }

    setupFocusManagement() {
        // Trap focus within active communication area
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.currentMode) {
                const activeArea = document.getElementById(`${this.currentMode}-interface`);
                const focusableElements = activeArea.querySelectorAll(
                    'button, input, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    selectMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-card').forEach(card => card.classList.remove('active'));
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        document.querySelectorAll('.communication-area').forEach(area => area.classList.remove('active'));
        document.getElementById(`${mode}-interface`).classList.add('active');
        
        // Announce mode selection
        const modeText = mode === 'deaf' ? 'Mode Tuli - Interface Visual' : 'Mode Buta - Interface Suara';
        this.speak(`${modeText} telah dipilih`);
        
        // Start gesture detection for deaf mode
        if (mode === 'deaf') {
            this.startHandDetection();
        } else {
            this.stopHandDetection();
        }
        
        // Focus management
        setTimeout(() => {
            const firstInput = document.querySelector(`#${mode}-interface input, #${mode}-interface button`);
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
        
        this.updateStatus(mode, `Mode ${mode === 'deaf' ? 'Tuli' : 'Buta'} aktif`, false);
    }

    // AI-Enhanced Communication Methods
    async sendTextMessage() {
        const input = document.getElementById('deaf-text-input');
        const message = input.value.trim();
        
        if (!message) return;

        try {
            this.updateStatus('deaf', 'Mengirim pesan...', 'processing');
            
            // Add message to deaf panel
            this.addMessage('deaf', message, 'sent');
            
            // AI Enhancement disabled - using original message
            // const enhancedMessage = await aiService.enhanceWithNLP(message);
            
            // Display in blind panel (no BISINDO translation for text input, using original message)
            this.addMessage('blind', message, 'received');
            
            // Speak the message (using original message)
            this.speakText(message);
            
            input.value = '';
            this.updateStatus('deaf', 'Pesan terkirim', 'ready');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.updateStatus('deaf', 'Error mengirim pesan', 'error');
        }
    }

    async startVoiceRecording() {
        if (!this.recognition) {
            this.setupSpeechRecognition();
        }

        try {
            this.isRecording = true;
            this.updateStatus('blind', 'Merekam suara...', 'recording');
            
            const startBtn = document.getElementById('start-recording-btn');
            const stopBtn = document.getElementById('stop-recording-btn');
            
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            
            this.recognition.start();
            
        } catch (error) {
            console.error('Error starting voice recording:', error);
            this.updateStatus('blind', 'Error merekam suara', 'error');
        }
    }

    stopVoiceRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            
            const startBtn = document.getElementById('start-recording-btn');
            const stopBtn = document.getElementById('stop-recording-btn');
            
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
            
            this.updateStatus('blind', 'Berhenti merekam', 'ready');
        }
    }

    async toggleCamera() {
        const videoElement = document.getElementById('camera-feed');
        const placeholder = document.querySelector('.video-placeholder');
        const button = document.getElementById('start-camera-btn');
        const frameButton = document.getElementById('camera-activation-btn');
        
        try {
            if (!this.cameraStream) {
                // Check if getUserMedia is supported
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Browser tidak mendukung akses kamera');
                }

                this.updateStatus('blind', 'Meminta izin kamera...', 'processing');
                
                // Request camera permission with better constraints
                const constraints = {
                    video: {
                        width: { ideal: 640, max: 1280 },
                        height: { ideal: 480, max: 720 },
                        facingMode: 'user'
                    }
                };

                this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (videoElement && this.cameraStream) {
                    videoElement.srcObject = this.cameraStream;
                    videoElement.style.display = 'block';
                    
                    // Wait for video to load
                    await new Promise((resolve) => {
                        videoElement.onloadedmetadata = () => {
                            videoElement.play();
                            resolve();
                        };
                    });
                    
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    if (button) {
                        button.textContent = '📹 Matikan Kamera';
                        button.setAttribute('aria-label', 'Matikan kamera BISINDO');
                    }
                    
                    if (frameButton) {
                        frameButton.innerHTML = '<span class="camera-icon">📹</span><span class="camera-text">Matikan Kamera</span>';
                    }
                    
                    this.updateStatus('blind', 'Kamera aktif - Siap untuk BISINDO', 'ready');
                    this.speak('Kamera berhasil diaktifkan untuk komunikasi BISINDO');
                    
                    // Start hand detection
                    this.startHandDetection();
                }
                
            } else {
                // Stop camera
                if (this.cameraStream) {
                    this.cameraStream.getTracks().forEach(track => {
                        track.stop();
                        console.log('Camera track stopped:', track.kind);
                    });
                    this.cameraStream = null;
                }
                
                if (videoElement) {
                    videoElement.srcObject = null;
                    videoElement.style.display = 'none';
                }
                
                if (placeholder) {
                    placeholder.style.display = 'flex';
                }
                
                if (button) {
                    button.textContent = '📹 Aktifkan Kamera';
                    button.setAttribute('aria-label', 'Aktifkan kamera BISINDO');
                }
                
                if (frameButton) {
                    frameButton.innerHTML = '<span class="camera-icon">📷</span><span class="camera-text">Aktifkan Kamera</span>';
                }
                
                this.updateStatus('blind', 'Kamera dimatikan', 'ready');
                this.speak('Kamera telah dimatikan');
                
                // Stop hand detection
                this.stopHandDetection();
            }
        } catch (error) {
            console.error('Camera error:', error);
            
            let errorMessage = 'Error mengakses kamera';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Kamera tidak ditemukan. Pastikan kamera terhubung.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Browser tidak mendukung akses kamera.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Kamera sedang digunakan aplikasi lain.';
            }
            
            this.updateStatus('blind', errorMessage, 'error');
            this.speak(errorMessage);
            
            // Reset button state
            if (button) {
                button.textContent = '📹 Aktifkan Kamera';
                button.setAttribute('aria-label', 'Aktifkan kamera BISINDO');
            }
        }
    }

    async translateBisindoToText() {
        const video = document.getElementById('camera-feed');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        try {
            if (!this.cameraStream) {
                this.updateStatus('blind', 'Aktifkan kamera terlebih dahulu', 'error');
                this.speak('Silakan aktifkan kamera terlebih dahulu untuk menerjemahkan BISINDO');
                return;
            }

            this.updateStatus('blind', 'Menganalisis gerakan BISINDO...', 'processing');
            
            // Capture frame from video
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Use the latest hand detection data if available, otherwise analyze current frame
            let analysisResult;
            if (this.lastHandDetection && this.lastHandDetection.success) {
                analysisResult = this.lastHandDetection;
            } else {
                // Analyze current frame
                analysisResult = await aiService.analyzeHandGestures(canvas);
            }
            
            if (analysisResult.success) {
                let translatedText;
                
                if (analysisResult.interpretation) {
                    // Use simple direct mapping instead of AI translation
                    translatedText = this.getSimpleTranslation(analysisResult.interpretation);
                } else if (analysisResult.hands && analysisResult.hands.length > 0) {
                    // Use direct gesture mapping
                    const gesture = analysisResult.hands[0].gesture;
                    if (gesture) {
                        translatedText = this.mapGestureToText(gesture);
                    } else {
                        translatedText = 'Gerakan terdeteksi';
                    }
                } else {
                    translatedText = 'Tidak ada gerakan BISINDO yang dapat dikenali';
                }
                
                this.addMessage('blind', translatedText, 'received');
                this.updateStatus('blind', `Terdeteksi: ${translatedText}`, 'ready');
                this.speak(`Terjemahan BISINDO: ${translatedText}`);
                
                // Also send to deaf panel
                this.addMessage('deaf', `[BISINDO] ${translatedText}`, 'received');
                
            } else {
                this.updateStatus('blind', 'Tidak ada gerakan BISINDO terdeteksi', 'ready');
                this.speak('Tidak ada gerakan BISINDO yang dapat dikenali');
            }

        } catch (error) {
            console.error('BISINDO translation error:', error);
            this.updateStatus('blind', 'Error dalam terjemahan', 'error');
            this.speak('Terjadi kesalahan dalam menerjemahkan gerakan BISINDO');
        }
    }

    async translateToBisindo() {
        const lastMessage = this.getLastMessage('blind');
        if (!lastMessage) {
            alert('Tidak ada pesan untuk diterjemahkan');
            return;
        }

        try {
            this.updateStatus('blind', 'Menerjemahkan ke BISINDO...', 'processing');
            
            const bisindoTranslation = await aiService.translateToBisindo(lastMessage);
            this.displayBisindo('bisindo-output', bisindoTranslation);
            
            this.updateStatus('blind', 'Diterjemahkan ke BISINDO', 'ready');
            
        } catch (error) {
            console.error('BISINDO translation error:', error);
            this.updateStatus('blind', 'Error terjemahan BISINDO', 'error');
        }
    }

    async enhanceWithAI() {
        const lastMessage = this.getLastMessage('blind');
        if (!lastMessage) {
            alert('Tidak ada pesan untuk ditingkatkan');
            return;
        }

        try {
            this.updateStatus('blind', 'Meningkatkan dengan AI...', 'processing');
            
            const enhancedMessage = await aiService.enhanceWithNLP(lastMessage.message);
            this.addMessage('blind', `AI Enhanced: ${enhancedMessage}`, 'enhanced');
            
            // Only translate to BISINDO if the original message was from audio
            if (lastMessage.source === 'audio') {
                const bisindoTranslation = await aiService.translateToBisindo(enhancedMessage);
                this.displayBisindo('bisindo-output', bisindoTranslation);
            }
            
            this.updateStatus('blind', 'Pesan ditingkatkan AI', 'ready');
            
        } catch (error) {
            console.error('AI enhancement error:', error);
            this.updateStatus('blind', 'Error peningkatan AI', 'error');
        }
    }

    startRecording() {
        if (this.recognition && !this.isRecording) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                this.speak('Tidak dapat memulai pengenalan suara');
            }
        } else if (!this.recognition) {
            this.speak('Pengenalan suara tidak tersedia di browser ini');
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    resetRecordingButtons() {
        document.getElementById('start-recording-btn').disabled = false;
        document.getElementById('stop-recording-btn').disabled = true;
    }

    speakLastMessage() {
        const messages = this.messages.deaf;
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.speak(lastMessage.content);
        } else {
            this.speak('Tidak ada pesan untuk dibacakan');
        }
    }

    playLastMessage() {
        const messages = this.messages.blind;
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.speak(`Pesan terakhir Anda: ${lastMessage.content}`);
        } else {
            this.speak('Tidak ada pesan untuk diputar ulang');
        }
    }

    speak(text) {
        if (this.synthesis) {
            // Cancel any ongoing speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Find Indonesian voice if available
            const voices = this.synthesis.getVoices();
            const indonesianVoice = voices.find(voice => 
                voice.lang.includes('id') || voice.name.includes('Indonesian')
            );
            
            if (indonesianVoice) {
                utterance.voice = indonesianVoice;
            }
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
            };
            
            this.synthesis.speak(utterance);
        }
    }

    speakText(text) {
        if (this.synthesis) {
            // Cancel any ongoing speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            this.synthesis.speak(utterance);
        }
    }

    // Helper Methods
    addMessage(mode, message, type, source = 'text') {
        const timestamp = new Date().toLocaleTimeString();
        const messageObj = { message, type, timestamp, source };
        
        this.messages[mode].push(messageObj);
        
        const messagesContainer = document.getElementById(`${mode}-messages`);
        if (messagesContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${timestamp}</div>
            `;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    displayBisindo(containerId, bisindoText) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Handle both string and object formats
        const translationText = typeof bisindoText === 'string' ? bisindoText : bisindoText.text || bisindoText.description || bisindoText;
        const hasVisual = typeof bisindoText === 'object' && bisindoText.hasVisual;
        const visualContent = typeof bisindoText === 'object' ? bisindoText.visual : null;
        
        // Create container with visual content
        container.innerHTML = `
            <div class="bisindo-content">
                <h4>🤟 BISINDO Translation:</h4>
                <div class="bisindo-text-content">
                    <p>${translationText}</p>
                </div>
                ${hasVisual && visualContent ? `
                <div class="bisindo-visual-container">
                    ${visualContent}
                </div>
                ` : ''}
                <small>Terjemahan bahasa isyarat Indonesia dengan file GIF</small>
            </div>
        `;

        // Add visual styles for GIF display
        this.addBisindoVisualStyles();
        this.addGifVisualStyles();
        
        // Scroll to show the translation
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Initialize Simple Animation
    async initSimpleAnimation(container, gestureType) {
        console.log('🎬 Initializing Simple Animation for:', gestureType);
        
        // Initialize the animation system quickly
        await this.simpleAnimation.init(container);
        console.log('✅ Simple Animation system ready');
        
        // Play the specific gesture animation immediately
        this.simpleAnimation.playGesture(gestureType);
        
        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.simpleAnimation.resize(width, height);
            }
        });
        resizeObserver.observe(container);
    }

    // Extract gesture type from BISINDO translation text
    extractGestureFromText(text) {
        const lowerText = text.toLowerCase();
        
        // Map common words to gesture types
        const gestureMap = {
            'aku': 'aku',
            'kamu': 'kamu',
            'mereka': 'mereka',
            'halo': 'hello',
            'hai': 'hello', 
            'salam': 'hello',
            'terima kasih': 'thank_you',
            'makasih': 'thank_you',
            'tolong': 'please',
            'silakan': 'please',
            'maaf': 'sorry',
            'ya': 'yes',
            'iya': 'yes',
            'tidak': 'no',
            'bantuan': 'help',
            'bagus': 'good',
            'baik': 'good',
            'buruk': 'bad',
            'jelek': 'bad',
            'air': 'water',
            'minum': 'water',
            'makan': 'eat',
            'tidur': 'sleep',
            'cinta': 'love',
            'sayang': 'love',
            'keluarga': 'family',
            'teman': 'friend'
        };
        
        // Find matching gesture
        for (const [keyword, gesture] of Object.entries(gestureMap)) {
            if (lowerText.includes(keyword)) {
                return gesture;
            }
        }
        
        // Default gesture if no match found
        return 'hello';
    }
    async init3DBisindoAnimation(container, gestureType) {
        try {
            // Import the 3D animation system
            const { bisindoAnimation3D } = await import('./config.js');
            
            // Initialize the 3D scene
            await bisindoAnimation3D.init(container);
            
            // Play the specific gesture
            setTimeout(() => {
                bisindoAnimation3D.playGesture(gestureType);
            }, 500);
            
            // Handle resize
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    bisindoAnimation3D.resize(width, height);
                }
            });
            resizeObserver.observe(container);
            
        } catch (error) {
            console.error('Error initializing 3D BISINDO animation:', error);
            // Fallback to 2D visual if 3D fails
            container.innerHTML = '<p>3D animation tidak tersedia, menggunakan deskripsi teks.</p>';
        }
    }

    addBisindoVisualStyles() {
        // Check if styles already exist
        if (document.getElementById('bisindo-visual-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'bisindo-visual-styles';
        style.textContent = `
        .bisindo-visual-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin: 10px 0;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .bisindo-visual-content svg {
            max-width: 300px;
            max-height: 300px;
            margin: 10px 0;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        .bisindo-visual-content .gesture-description {
            color: white;
            font-size: 16px;
            text-align: center;
            margin-top: 15px;
            font-weight: 500;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .bisindo-visual-content .gesture-title {
            color: #FFD700;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .bisindo-visual-content .hand-shape {
            fill: #FFE4B5;
            stroke: #8B4513;
            stroke-width: 2;
        }

        .bisindo-visual-content .hand-movement {
            fill: none;
            stroke: #FFD700;
            stroke-width: 3;
            stroke-dasharray: 5,5;
        }

        .bisindo-visual-content .gesture-arrow {
            fill: #FFD700;
            stroke: #FFA500;
            stroke-width: 1;
        }

        /* Animation for visual elements */
        .bisindo-visual-content svg {
            animation: gentle-pulse 2s ease-in-out infinite;
        }

        @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .bisindo-visual-content {
                padding: 15px;
                margin: 8px 0;
            }
            
            .bisindo-visual-content svg {
                max-width: 250px;
                max-height: 250px;
            }
            
            .bisindo-visual-content .gesture-description {
                font-size: 14px;
            }
            
            .bisindo-visual-content .gesture-title {
                font-size: 18px;
            }
        }
        `;
        document.head.appendChild(style);
    }

    addGifVisualStyles() {
        // Check if GIF styles already exist
        if (document.getElementById('bisindo-gif-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'bisindo-gif-styles';
        style.textContent = `
        .bisindo-visual-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .bisindo-gesture {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .gesture-gif {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            border: 3px solid rgba(255,255,255,0.3);
            background: white;
            padding: 10px;
        }

        .gesture-label {
            color: white;
            font-size: 18px;
            font-weight: bold;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        /* Animation for GIF container */
        .bisindo-gesture {
            animation: fade-in-up 0.6s ease-out;
        }

        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive design for GIFs */
        @media (max-width: 768px) {
            .gesture-gif {
                max-width: 150px;
                max-height: 150px;
            }
            
            .gesture-label {
                font-size: 16px;
            }
            
            .bisindo-visual-container {
                padding: 15px;
                margin: 10px 0;
            }
        }
        `;
        document.head.appendChild(style);
    }

    getLastMessage(mode) {
        const messages = this.messages[mode];
        return messages.length > 0 ? messages[messages.length - 1].message : null;
    }

    displayMessage(mode, message) {
        const displayElement = document.getElementById(`${mode}-messages`);
        if (displayElement) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message received';
            messageDiv.innerHTML = `
                <span class="message-content">${message}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            `;
            displayElement.appendChild(messageDiv);
            displayElement.scrollTop = displayElement.scrollHeight;
        }
    }

    async startHandDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        const video = document.getElementById('camera-feed');
        const canvas = document.getElementById('detection-canvas');
        const ctx = canvas.getContext('2d');
        const detectionIndicator = document.getElementById('detection-indicator');
        const detectionText = document.getElementById('detection-text');
        
        if (!video || !canvas) return;
        
        // Show detection canvas
        canvas.style.display = 'block';
        
        // Update status
        detectionText.textContent = 'Mendeteksi...';
        detectionIndicator.classList.add('detecting');
        
        this.handDetectionActive = true;
        
        // Real-time hand detection using simple detection
        this.detectionInterval = setInterval(async () => {
            if (!this.handDetectionActive || !video.videoWidth) return;
            
            try {
                // Set canvas size to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Clear previous drawings
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Check if video is actually playing and has content
                if (video.readyState < 2) {
                    detectionText.textContent = 'Menunggu kamera...';
                    return;
                }
                
                // Capture current video frame with optimization
                const captureCanvas = document.createElement('canvas');
                // Reduce canvas size for faster processing while maintaining quality
                const scaleFactor = 0.5; // Process at 50% size for speed
                captureCanvas.width = video.videoWidth * scaleFactor;
                captureCanvas.height = video.videoHeight * scaleFactor;
                const captureCtx = captureCanvas.getContext('2d');
                captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
                
                // Verify canvas has actual video content
                const imageData = captureCtx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
                let hasVideoContent = false;
                for (let i = 0; i < imageData.data.length; i += 40) {
                    if (imageData.data[i] > 20 || imageData.data[i + 1] > 20 || imageData.data[i + 2] > 20) {
                        hasVideoContent = true;
                        break;
                    }
                }
                
                if (!hasVideoContent) {
                    detectionText.textContent = 'Kamera tidak aktif';
                    return;
                }
                
                // Analyze frame with simple hand detection
                console.log('Analyzing frame with simple detection...');
                let analysisResult;
                
                try {
                    analysisResult = await aiService.analyzeHandGesturesSimple(captureCanvas);
                    console.log('Simple detection result:', analysisResult);
                } catch (simpleError) {
                    console.error('Simple detection error:', simpleError);
                    analysisResult = { success: false, error: simpleError.message };
                }
                
                // If simple detection fails or doesn't detect anything, fallback to external AI
                if (!analysisResult.success || !analysisResult.gesture || analysisResult.gesture === 'UNKNOWN') {
                    console.log('Simple detection failed, using external AI...');
                    try {
                        analysisResult = await aiService.analyzeHandGestures(captureCanvas);
                        console.log('External AI Analysis result:', analysisResult);
                    } catch (aiError) {
                        console.error('External AI error:', aiError);
                        analysisResult = { 
                            success: false, 
                            error: 'Both simple detection and External AI failed',
                            gesture: 'UNKNOWN'
                        };
                    }
                }
                
                if (analysisResult.success) {
                    // Handle both simple detection and External AI format with direct gesture detection
                    if (analysisResult.gesture && analysisResult.gesture !== 'UNKNOWN') {
                        // Check if detected gesture matches BISINDO gestures: AKU, KAMU, MEREKA
                        const bisindoGestures = ['AKU', 'KAMU', 'MEREKA'];
                        const detectedGesture = analysisResult.gesture.toUpperCase();
                        
                        if (bisindoGestures.includes(detectedGesture)) {
                            // Display BISINDO gesture detection with confidence and source
                            const source = analysisResult.source || 'Simple Detection';
                            detectionText.textContent = `BISINDO: ${detectedGesture} (${Math.round(analysisResult.confidence * 100)}%) - ${source}`;
                            detectionIndicator.classList.add('detecting');
                            
                            // Store detection data for BISINDO translation
                            this.lastHandDetection = analysisResult;
                            
                            // Draw simple detection overlay instead of enhanced overlay
                            this.drawFallbackDetection(ctx, canvas.width, canvas.height);
                            
                            // Real-time translation to overlay
                            await this.updateTranslationOverlay(this.lastHandDetection);
                            
                            // Also trigger deaf mode display if available
                            if (window.deafMode && window.deafMode.isActive) {
                                window.deafMode.onGestureDetected(analysisResult.gesture);
                            }
                        } else {
                            // Gesture detected but not BISINDO AKU, KAMU, MEREKA
                            detectionText.textContent = 'Tidak ada gerakan BISINDO';
                            detectionIndicator.classList.remove('detecting');
                            
                            // Draw simple detection overlay for non-BISINDO detection
                            this.drawFallbackDetection(ctx, canvas.width, canvas.height);
                            
                            // Still update overlay to show non-BISINDO detection
                            await this.updateTranslationOverlay(analysisResult);
                        }
                    } else {
                        // No gesture detected or unknown gesture
                        detectionText.textContent = 'Tidak ada gerakan BISINDO';
                        detectionIndicator.classList.remove('detecting');
                        
                        // Draw simple detection overlay for no gesture
                        this.drawFallbackDetection(ctx, canvas.width, canvas.height);
                        
                        // Update overlay to show no gesture state
                        await this.updateTranslationOverlay({ handsDetected: false });
                    }
                } else {
                    // No hands detected or analysis failed - show appropriate message
                    const errorMsg = analysisResult.error || 'Tidak ada gerakan BISINDO';
                    detectionText.textContent = errorMsg;
                    detectionIndicator.classList.remove('detecting');
                    this.hideHandBoxes();
                    
                    // Update overlay to show no hands detected state
                    await this.updateTranslationOverlay({ handsDetected: false });
                    
                    // Draw simple detection overlay showing analysis details
                    this.drawFallbackDetection(ctx, canvas.width, canvas.height);
                }
                
            } catch (error) {
                console.error('Hand detection error:', error);
                detectionText.textContent = 'Error Deteksi';
                detectionIndicator.classList.remove('detecting');
                
                // Draw enhanced error overlay
                this.drawErrorOverlay(ctx, error, canvas.width, canvas.height);
            }
            
        }, 100); // Real-time analysis for smooth gesture detection (10 FPS)
    }
    
    drawRealHandDetection(ctx, hands, width, height) {
        hands.forEach((hand, index) => {
            // Draw bounding box
            if (hand.bbox) {
                const bbox = hand.bbox;
                ctx.strokeStyle = hand.handedness === 'Left' ? '#00ff88' : '#ff8800';
                ctx.lineWidth = 3;
                ctx.fillStyle = hand.handedness === 'Left' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 136, 0, 0.1)';
                
                const x = bbox.x * width;
                const y = bbox.y * height;
                const w = bbox.width * width;
                const h = bbox.height * height;
                
                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
                
                // Add label with confidence
                ctx.fillStyle = hand.handedness === 'Left' ? '#00ff88' : '#ff8800';
                ctx.font = '14px Arial';
                const label = `${hand.handedness} (${Math.round(hand.confidence * 100)}%)`;
                ctx.fillText(label, x, y - 5);
                
                // Add gesture if detected
                if (hand.gesture) {
                    ctx.fillText(`Gesture: ${hand.gesture}`, x, y + h + 20);
                }
            }
            
            // Draw keypoints if available
            if (hand.keypoints && hand.keypoints.length > 0) {
                ctx.fillStyle = hand.handedness === 'Left' ? '#00ff88' : '#ff8800';
                hand.keypoints.forEach(point => {
                    const x = point.x * width;
                    const y = point.y * height;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
        });
    }
    
    drawFallbackDetection(ctx, width, height) {
        // Simple fallback visualization when API fails
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const boxWidth = 120;
        const boxHeight = 150;
        
        ctx.strokeRect(centerX - boxWidth/2, centerY - boxHeight/2, boxWidth, boxHeight);
        
        ctx.fillStyle = '#ffaa00';
        ctx.font = '12px Arial';
        ctx.fillText('Menganalisis...', centerX - 40, centerY - boxHeight/2 - 10);
        
        ctx.setLineDash([]); // Reset line dash
    }
    
    showHandBoxes(leftHand, rightHand, videoWidth, videoHeight) {
        const container = document.querySelector('.video-container');
        const containerRect = container.getBoundingClientRect();
        
        const scaleX = containerRect.width / videoWidth;
        const scaleY = containerRect.height / videoHeight;
        
        const leftBox = document.getElementById('hand-box-1');
        const rightBox = document.getElementById('hand-box-2');
        
        if (leftBox) {
            leftBox.style.left = (leftHand.x * scaleX) + 'px';
            leftBox.style.top = (leftHand.y * scaleY) + 'px';
            leftBox.style.width = (leftHand.width * scaleX) + 'px';
            leftBox.style.height = (leftHand.height * scaleY) + 'px';
            leftBox.classList.add('active');
        }
        
        if (rightBox) {
            rightBox.style.left = (rightHand.x * scaleX) + 'px';
            rightBox.style.top = (rightHand.y * scaleY) + 'px';
            rightBox.style.width = (rightHand.width * scaleX) + 'px';
            rightBox.style.height = (rightHand.height * scaleY) + 'px';
            rightBox.classList.add('active');
        }
    }
    
    hideHandBoxes() {
        const leftBox = document.getElementById('hand-box-1');
        const rightBox = document.getElementById('hand-box-2');
        
        if (leftBox) leftBox.classList.remove('active');
        if (rightBox) rightBox.classList.remove('active');
    }

    async updateTranslationOverlay(analysisResult) {
        const overlay = document.getElementById('translation-overlay');
        const translationText = document.getElementById('realtime-translation');
        
        // Get bottom detection overlay elements - REMOVED
        // const detectionOverlay = document.getElementById('detection-results-overlay');
        // const detectionContent = document.getElementById('detection-content');
        // const detectionDetails = document.getElementById('detection-details');
        
        console.log('updateTranslationOverlay called', { overlay, translationText, analysisResult });
        
        if (!overlay || !translationText) {
            console.error('Overlay elements not found:', { overlay, translationText });
            return;
        }
        
        try {
            let translatedText = '';
            let confidenceLevel = 0;
            let gestureType = '';
            let detectionStatus = '';
            let detectionInfo = '';
            
            // Enhanced handling for simple detection format with detailed analysis
            if (analysisResult && analysisResult.gesture && analysisResult.gesture !== 'UNKNOWN') {
                const detectedGesture = analysisResult.gesture.toUpperCase();
                const bisindoGestures = ['AKU', 'KAMU', 'MEREKA'];
                
                if (bisindoGestures.includes(detectedGesture)) {
                    confidenceLevel = Math.round(analysisResult.confidence * 100);
                    gestureType = analysisResult.gestureType || 'unknown';
                    
                    // Enhanced translation with context and stability info
                    const stabilityInfo = analysisResult.movementContext ? 
                        (analysisResult.movementContext.isStable ? '✓ Stabil' : '⚠ Bergerak') : '';
                    
                    const consistencyInfo = analysisResult.consistency ? 
                        `${Math.round(analysisResult.consistency * 100)}% konsisten` : '';
                    
                    // Create detailed translation text
                    translatedText = `${detectedGesture}`;
                    
                    // Add confidence and stability indicators
                    const indicators = [];
                    if (confidenceLevel >= 80) indicators.push('🟢 Tinggi');
                    else if (confidenceLevel >= 60) indicators.push('🟡 Sedang');
                    else indicators.push('🔴 Rendah');
                    
                    if (stabilityInfo) indicators.push(stabilityInfo);
                    if (consistencyInfo) indicators.push(consistencyInfo);
                    
                    if (indicators.length > 0) {
                        translatedText += ` (${indicators.join(', ')})`;
                    }
                    
                    // Update bottom detection overlay
                    detectionStatus = `✅ Terdeteksi: ${detectedGesture}`;
                    detectionInfo = `Confidence: ${confidenceLevel}% | ${stabilityInfo || 'Analisis gerakan'} | ${consistencyInfo || 'Pola gerakan'}`;
                    
                    // Add voice feedback for detected BISINDO gestures
                    this.announceGestureDetection(detectedGesture, confidenceLevel);
                    
                } else {
                    // Enhanced handling for non-BISINDO gestures
                    const mappedGesture = this.mapGestureToText(detectedGesture);
                    if (mappedGesture !== 'Gerakan tidak dikenali') {
                        translatedText = mappedGesture;
                        confidenceLevel = Math.round(analysisResult.confidence * 100);
                        
                        // Update bottom detection overlay for non-BISINDO
                        detectionStatus = `⚠️ Gerakan terdeteksi: ${detectedGesture}`;
                        detectionInfo = `Confidence: ${confidenceLevel}% | Bukan gerakan BISINDO standar`;
                    } else {
                        translatedText = 'Menunggu gerakan BISINDO...';
                        detectionStatus = `❓ Gerakan tidak dikenali: ${detectedGesture}`;
                        detectionInfo = `Confidence: ${confidenceLevel}% | Coba gerakan AKU, KAMU, atau MEREKA`;
                    }
                }
            } else if (analysisResult && analysisResult.handsDetected === false) {
                // No hands detected - keep UI clean without showing detection status
                translatedText = 'Menunggu gerakan BISINDO...';
                detectionStatus = '';
                detectionInfo = '';
            } else if (analysisResult && analysisResult.processing) {
                // Processing state
                translatedText = 'Menganalisis gerakan...';
                detectionStatus = '🔄 Sedang memproses...';
                detectionInfo = 'Sistem sedang menganalisis gerakan tangan';
            } else {
                // Default waiting state
                translatedText = 'Menunggu gerakan BISINDO...';
                detectionStatus = '⏳ Menunggu input';
                detectionInfo = 'Aktifkan kamera dan lakukan gerakan BISINDO';
            }
            
            // Update bottom detection overlay - REMOVED
            // if (detectionOverlay && detectionContent && detectionDetails) {
            //     detectionContent.textContent = detectionStatus;
            //     detectionDetails.textContent = detectionInfo;
            //     
            //     // Update styling based on detection state
            //     detectionOverlay.classList.remove('no-detection', 'has-detection');
            //     if (analysisResult && analysisResult.gesture && analysisResult.gesture !== 'UNKNOWN') {
            //         detectionOverlay.classList.add('has-detection');
            //     } else {
            //         detectionOverlay.classList.add('no-detection');
            //     }
            // }
            
            console.log('Enhanced translation result:', { translatedText, confidenceLevel, gestureType, detectionStatus });
            
            // Enhanced overlay display with better UX
            if (translatedText && translatedText.trim() && !translatedText.includes('Menunggu')) {
                // Show overlay with enhanced styling based on confidence
                translationText.textContent = translatedText;
                overlay.classList.add('active');
                
                // Add confidence-based styling
                overlay.classList.remove('high-confidence', 'medium-confidence', 'low-confidence');
                if (confidenceLevel >= 80) {
                    overlay.classList.add('high-confidence');
                } else if (confidenceLevel >= 60) {
                    overlay.classList.add('medium-confidence');
                } else if (confidenceLevel > 0) {
                    overlay.classList.add('low-confidence');
                }
                
                console.log('Enhanced overlay activated with confidence styling');
                
            } else {
                // Show waiting state with subtle indication
                translationText.textContent = translatedText;
                overlay.classList.remove('active', 'high-confidence', 'medium-confidence', 'low-confidence');
                overlay.classList.add('waiting');
                console.log('Overlay in waiting state');
            }
            
        } catch (error) {
            console.error('Translation overlay error:', error);
            translationText.textContent = 'Error dalam analisis gerakan';
            overlay.classList.add('active', 'error');
        }
    }

    // Voice feedback for gesture detection
    announceGestureDetection(gesture, confidence) {
        // Only announce high confidence detections to avoid spam
        if (confidence >= 70) {
            // Directly announce the gesture name without "Terdeteksi gerakan"
            const announcement = gesture;
            
            // Use existing speak method if available, otherwise use Web Speech API
            if (this.speak && typeof this.speak === 'function') {
                this.speak(announcement);
            } else {
                // Fallback to Web Speech API
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(announcement);
                    utterance.lang = 'id-ID'; // Indonesian language
                    utterance.rate = 0.8; // Slightly slower for clarity
                    utterance.volume = 0.8; // Slightly higher volume for clarity
                    speechSynthesis.speak(utterance);
                }
            }
            
            console.log(`Voice announcement: ${announcement} (Confidence: ${confidence}%)`);
        }
    }

    // Enhanced gesture to text mapping with improved accuracy
    mapGestureToText(gesture) {
        // Simplified mapping - any detected gesture = MEREKA
        if (gesture && gesture !== 'UNKNOWN') {
            return 'MEREKA';
        }
        return 'UNKNOWN';
    }

    // Enhanced pattern analysis for better gesture recognition
    analyzeGesturePattern(gesture) {
        const gestureStr = gesture.toLowerCase();
        
        // Pattern matching for self-reference
        if (gestureStr.includes('self') || gestureStr.includes('inward') || 
            gestureStr.includes('me') || gestureStr.includes('pointing_in')) {
            return 'AKU';
        }
        
        // Pattern matching for other-reference
        if (gestureStr.includes('other') || gestureStr.includes('outward') || 
            gestureStr.includes('you') || gestureStr.includes('pointing_out')) {
            return 'KAMU';
        }
        
        // Pattern matching for group-reference
        if (gestureStr.includes('group') || gestureStr.includes('multiple') || 
            gestureStr.includes('them') || gestureStr.includes('open')) {
            return 'MEREKA';
        }
        
        // Default for unrecognized gestures
        return 'Gerakan tidak dikenali';
    }

    // Enhanced simple translation with context awareness
    getSimpleTranslation(interpretation) {
        if (!interpretation) return 'Tidak ada interpretasi';
        
        const text = interpretation.toLowerCase();
        
        // Enhanced keyword matching with context
        const patterns = [
            { keywords: ['aku', 'saya', 'diri', 'self'], translation: 'AKU' },
            { keywords: ['kamu', 'anda', 'you'], translation: 'KAMU' },
            { keywords: ['mereka', 'dia', 'kalian', 'kita', 'them'], translation: 'MEREKA' },
            { keywords: ['menunjuk diri', 'pointing self'], translation: 'AKU' },
            { keywords: ['menunjuk keluar', 'pointing out'], translation: 'KAMU' },
            { keywords: ['tangan terbuka', 'open hand'], translation: 'MEREKA' }
        ];
        
        for (const pattern of patterns) {
            if (pattern.keywords.some(keyword => text.includes(keyword))) {
                return pattern.translation;
            }
        }
        
        // Fallback to original interpretation if no pattern matches
        return interpretation;
    }

    // Simple translation for complex interpretations
    getSimpleTranslation(interpretation) {
        const text = interpretation.toLowerCase();
        
        // Look for key words and return simple translations
        if (text.includes('menunjuk') || text.includes('pointing') || text.includes('jari telunjuk')) {
            return 'AKU';
        } else if (text.includes('dua jari') || text.includes('peace') || text.includes('v sign')) {
            return 'KAMU';
        } else if (text.includes('terbuka') || text.includes('lima jari') || text.includes('open hand')) {
            return 'MEREKA';
        } else if (text.includes('tangan') || text.includes('gerakan')) {
            return 'Gerakan BISINDO';
        } else {
            return 'Mendeteksi...';
        }
    }

    hideTranslationOverlay() {
        const overlay = document.getElementById('translation-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    stopHandDetection() {
        this.handDetectionActive = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        const canvas = document.getElementById('detection-canvas');
        const detectionIndicator = document.getElementById('detection-indicator');
        const detectionText = document.getElementById('detection-text');
        
        if (canvas) {
            canvas.style.display = 'none';
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (detectionIndicator) {
            detectionIndicator.classList.remove('detecting');
        }
        
        if (detectionText) {
            detectionText.textContent = 'Menunggu...';
        }
        
        }

    updateStatus(mode, message, status) {
        const statusText = document.getElementById(`${mode}-status-text`);
        const statusDot = document.getElementById(`${mode}-status`);
        
        if (statusText) {
            statusText.textContent = message;
        }
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
    }

    // Utility method for demo purposes
    simulateIncomingMessage(mode, message) {
        setTimeout(() => {
            this.displayMessage(mode, `Pesan masuk: "${message}"`);
            if (mode === 'blind') {
                this.speak(`Pesan masuk: ${message}`);
            }
        }, 1000);
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.accessibilityPlatform = new AccessibilityPlatform();
    console.log('BISIK AI Platform initialized with BytePlus AI integration');
    
    // Initialize Deaf Mode
    try {
        const { default: DeafMode } = await import('./deaf-mode.js');
        window.deafMode = new DeafMode();
        await window.deafMode.initialize();
        console.log('🤟 Deaf Mode initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Deaf Mode:', error);
    }
});

// Global function to toggle camera (for onclick handlers)
window.toggleCamera = function() {
    if (window.accessibilityPlatform) {
        window.accessibilityPlatform.toggleCamera();
    } else {
        console.error('AccessibilityPlatform not initialized');
    }
}

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}