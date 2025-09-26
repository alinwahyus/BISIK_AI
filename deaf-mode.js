/**
 * Deaf Mode for BISINDO
 * Integrates gesture detection with visual feedback
 */

import GestureDetection from './gesture-detection.js';

class DeafMode {
    constructor() {
        this.gestureDetection = new GestureDetection();
        this.isActive = false;
        this.currentGesture = null;
        this.gestureHistory = [];
        this.confidenceThreshold = 0.7;
        this.gestureTimeout = 2000; // 2 seconds
        this.lastGestureTime = 0;
    }

    // Initialize deaf mode
    async initialize() {
        console.log('🔇 Initializing Deaf Mode...');
        
        try {
            // Set up gesture detection callback
            this.gestureDetection.setGestureCallback(this.onGestureDetected.bind(this));
            
            // Train gesture patterns
            await this.gestureDetection.trainFromGifs();
            
            // Create UI elements
            this.createDeafModeUI();
            
            console.log('✅ Deaf Mode initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Deaf Mode:', error);
            return false;
        }
    }

    // Create deaf mode UI
    createDeafModeUI() {
        const container = document.getElementById('bisindo-container');
        if (!container) return;

        // Create deaf mode panel
        const deafModePanel = document.createElement('div');
        deafModePanel.id = 'deaf-mode-panel';
        deafModePanel.className = 'deaf-mode-panel';
        deafModePanel.innerHTML = `
            <div class="camera-section" id="camera-section">
                <video id="gesture-camera" autoplay muted playsinline></video>
                <canvas id="gesture-overlay"></canvas>
            </div>
            
            <div class="gesture-feedback" id="gesture-feedback">
                <div class="detected-gesture">
                    <span class="gesture-label">Gerakan Terdeteksi:</span>
                    <span class="gesture-value" id="current-gesture">-</span>
                    <div class="gesture-status" id="gesture-status">Menunggu gerakan AKU, KAMU, atau MEREKA...</div>
                </div>
                <div class="gesture-confidence">
                    <span class="confidence-label">Tingkat Kepercayaan:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" id="confidence-fill"></div>
                    </div>
                </div>
            </div>
            
            <div class="gesture-history" id="gesture-history">
                <h4>Riwayat Gerakan:</h4>
                <div class="history-list" id="history-list"></div>
            </div>
        `;

        container.appendChild(deafModePanel);

        // Add styles
        this.addDeafModeStyles();
        
        // Auto-start deaf mode
        this.startDeafMode();
    }

    // Add CSS styles for deaf mode
    addDeafModeStyles() {
        const styleId = 'deaf-mode-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .deaf-mode-panel {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                color: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }

            .deaf-mode-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .deaf-mode-header h3 {
                margin: 0;
                font-size: 1.5em;
            }

            .deaf-mode-toggle {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            }

            .deaf-mode-toggle:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }

            .deaf-mode-toggle.active {
                background: #4CAF50;
                border-color: #4CAF50;
            }

            .camera-section {
                position: relative;
                margin: 20px 0;
                border-radius: 10px;
                overflow: hidden;
                background: rgba(0,0,0,0.3);
            }

            #gesture-camera {
                width: 100%;
                max-width: 640px;
                height: auto;
                display: block;
            }

            #gesture-overlay {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }

            .gesture-feedback {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
                padding: 15px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
            }

            .detected-gesture, .gesture-confidence {
                text-align: center;
            }

            .gesture-label, .confidence-label {
                display: block;
                font-size: 0.9em;
                opacity: 0.8;
                margin-bottom: 5px;
            }

            .gesture-value {
                font-size: 1.5em;
                font-weight: bold;
                text-transform: uppercase;
                color: #FFD700;
            }

            .gesture-status {
                font-size: 0.8em;
                color: rgba(255,255,255,0.7);
                margin-top: 5px;
                font-style: italic;
            }

            .confidence-bar {
                width: 100%;
                height: 20px;
                background: rgba(255,255,255,0.2);
                border-radius: 10px;
                overflow: hidden;
                margin-top: 5px;
            }

            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1);
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 10px;
            }

            .gesture-history {
                margin-top: 20px;
            }

            .gesture-history h4 {
                margin: 0 0 10px 0;
                font-size: 1.1em;
            }

            .history-list {
                max-height: 150px;
                overflow-y: auto;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 10px;
            }

            .history-item {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .history-item:last-child {
                border-bottom: none;
            }

            .history-gesture {
                font-weight: bold;
                text-transform: uppercase;
            }

            .history-time {
                opacity: 0.7;
                font-size: 0.9em;
            }

            @media (max-width: 768px) {
                .deaf-mode-header {
                    flex-direction: column;
                    gap: 10px;
                }

                .gesture-feedback {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Toggle deaf mode on/off
    async toggleDeafMode() {
        const button = document.getElementById('toggle-deaf-mode');
        const cameraSection = document.getElementById('camera-section');

        if (!this.isActive) {
            try {
                button.textContent = 'Menginisialisasi...';
                button.disabled = true;

                await this.startDeafMode();
                
                button.textContent = 'Matikan Mode Tuli';
                button.classList.add('active');
                button.disabled = false;
                cameraSection.style.display = 'block';
                
                console.log('✅ Deaf Mode activated');
            } catch (error) {
                console.error('❌ Failed to start Deaf Mode:', error);
                button.textContent = 'Aktifkan Mode Tuli';
                button.disabled = false;
                alert('Gagal mengaktifkan mode tuli. Pastikan kamera tersedia.');
            }
        } else {
            this.stopDeafMode();
            button.textContent = 'Aktifkan Mode Tuli';
            button.classList.remove('active');
            cameraSection.style.display = 'none';
            console.log('⏹️ Deaf Mode deactivated');
        }
    }

    // Start deaf mode
    async startDeafMode() {
        this.isActive = true;
        await this.gestureDetection.startDetection();
        this.updateGestureFeedback('-', 0);
    }

    // Stop deaf mode
    stopDeafMode() {
        this.isActive = false;
        this.gestureDetection.stopDetection();
        this.updateGestureFeedback('-', 0);
    }

    // Handle hand detection callback
    onGestureDetected(gestureData) {
        // Handle both object and string formats
        let gesture, confidence;
        
        if (typeof gestureData === 'object' && gestureData !== null) {
            gesture = gestureData.gesture;
            confidence = gestureData.confidence || 0.5;
        } else {
            gesture = gestureData;
            confidence = 0.5;
        }
        
        console.log('👋 Hand detected in deaf mode:', gesture, 'confidence:', confidence);
        
        if (gesture === 'hand_detected') {
            this.updateHandFeedback(confidence);
            
            // Add to detection history
            this.gestureHistory.push({
                gesture: gesture,
                timestamp: Date.now(),
                confidence: confidence
            });
            
            // Keep only last 10 detections
            if (this.gestureHistory.length > 10) {
                this.gestureHistory.shift();
            }
        }
    }

    // Update gesture feedback UI
    updateGestureFeedback(gesture, confidence) {
        const gestureElement = document.getElementById('current-gesture');
        const confidenceFill = document.getElementById('confidence-fill');
        const statusElement = document.getElementById('gesture-status');
        
        if (gestureElement) {
            gestureElement.textContent = gesture === '-' ? '-' : gesture.toUpperCase();
        }
        
        if (confidenceFill) {
            confidenceFill.style.width = `${confidence * 100}%`;
        }
        
        if (statusElement) {
            if (gesture === '-') {
                statusElement.textContent = 'Menunggu gerakan AKU, KAMU, atau MEREKA...';
                statusElement.style.color = 'rgba(255,255,255,0.7)';
            } else {
                statusElement.textContent = `Gerakan ${gesture.toUpperCase()} berhasil diterjemahkan!`;
                statusElement.style.color = '#4CAF50';
            }
        }
    }

    // Update hand detection feedback
    updateHandFeedback(confidence) {
        const feedbackElement = document.getElementById('gesture-feedback');
        if (feedbackElement) {
            const confidencePercent = Math.round(confidence * 100);
            feedbackElement.innerHTML = `
                <div class="hand-detection-status">
                    <span class="hand-icon">👋</span>
                    <span class="detection-text">Tangan Terdeteksi</span>
                    <span class="confidence-score">${confidencePercent}%</span>
                </div>
            `;
            feedbackElement.className = 'gesture-feedback active';
            
            // Clear feedback after 2 seconds
            setTimeout(() => {
                if (feedbackElement) {
                    feedbackElement.className = 'gesture-feedback';
                    feedbackElement.innerHTML = '<span class="waiting-text">Menunggu deteksi tangan...</span>';
                }
            }, 2000);
        }
    }

    // Add gesture to history
    addToHistory(gesture) {
        const timestamp = new Date().toLocaleTimeString('id-ID');
        this.gestureHistory.unshift({ gesture, timestamp });
        
        // Keep only last 10 gestures
        if (this.gestureHistory.length > 10) {
            this.gestureHistory = this.gestureHistory.slice(0, 10);
        }
        
        this.updateHistoryDisplay();
    }

    // Add gesture to deaf messages display
    addToDeafMessages(gesture) {
        const deafMessagesDiv = document.getElementById('deaf-messages');
        if (!deafMessagesDiv) return;
        
        // Clear any existing content
        if (deafMessagesDiv.textContent.trim() !== '') {
            deafMessagesDiv.innerHTML = '';
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = gesture.toUpperCase();
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('id-ID');
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        // Add to messages display
        deafMessagesDiv.appendChild(messageDiv);
        
        // Scroll to bottom to show latest message
        deafMessagesDiv.scrollTop = deafMessagesDiv.scrollHeight;
    }

    // Update history display
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        historyList.innerHTML = this.gestureHistory.map(item => `
            <div class="history-item">
                <span class="history-gesture">${item.gesture}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        `).join('');
    }

    // Display BISINDO for detected gesture
    displayBisindoForGesture(gesture) {
        // Use existing displayBisindo function from main script
        if (window.bisikApp && typeof window.bisikApp.displayBisindo === 'function') {
            window.bisikApp.displayBisindo('bisindo-container', gesture.toUpperCase());
        } else {
            console.warn('displayBisindo function not found on main app');
            // Fallback - try to update translation overlay directly
            const overlay = document.getElementById('translation-overlay');
            const translationText = document.getElementById('realtime-translation');
            if (overlay && translationText) {
                translationText.textContent = gesture.toUpperCase();
                overlay.classList.add('active');
                console.log('Fallback: Updated translation overlay directly');
            }
        }
    }

    // Get current status
    getStatus() {
        return {
            isActive: this.isActive,
            currentGesture: this.currentGesture,
            historyCount: this.gestureHistory.length
        };
    }
}

export default DeafMode;