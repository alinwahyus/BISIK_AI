/**
 * Simple Animation System for BISINDO
 * Replaces DragonBones with simple CSS-based animations
 */

class SimpleAnimation {
    constructor() {
        this.gifFiles = {
            'aku': '/GIF/AKU.gif',
            'kamu': '/GIF/KAMU.gif',
            'mereka': '/GIF/Mereka.gif'
        };
    }

    // Initialize animation in container
    init(container) {
        console.log('🎬 SimpleAnimation.init() called with container:', container);
        if (!container) {
            console.error('❌ No container provided to SimpleAnimation.init()');
            return Promise.resolve();
        }
        
        console.log('✅ Setting up GIF display container...');
        container.innerHTML = `
            <div class="gif-animation-wrapper">
                <div class="gif-placeholder">
                    <div class="gesture-icon">🤟</div>
                    <div class="animation-text">Siap menampilkan animasi BISINDO</div>
                </div>
            </div>
        `;
        
        console.log('🎨 Adding GIF display styles...');
        this.addGifStyles();
        console.log('✅ SimpleAnimation initialization complete');
        
        // Return resolved promise immediately to avoid delays
        return Promise.resolve();
    }

    // Play specific gesture animation by displaying GIF
    playGesture(gestureType) {
        console.log('🎭 SimpleAnimation.playGesture() called with:', gestureType);
        const gifPath = this.gifFiles[gestureType] || this.gifFiles['aku'];
        console.log('🎯 GIF file path:', gifPath);
        
        const wrapper = document.querySelector('.gif-animation-wrapper');
        if (!wrapper) {
            console.error('❌ GIF wrapper not found!');
            return;
        }
        
        console.log('🚀 Displaying GIF animation...');
        wrapper.innerHTML = `
            <div class="gif-display">
                <img src="${gifPath}" alt="${gestureType.toUpperCase()} Gesture" class="bisindo-gif">
                <div class="gesture-label">${gestureType.toUpperCase()}</div>
            </div>
        `;
        
        console.log('✅ GIF animation displayed successfully');
    }

    // Add GIF display styles
    addGifStyles() {
        const styleId = 'gif-animation-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .gif-animation-wrapper {
                width: 100%;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                margin: 10px 0;
                overflow: hidden;
                position: relative;
            }
            
            .gif-placeholder {
                text-align: center;
                color: white;
            }
            
            .gif-placeholder .gesture-icon {
                font-size: 3rem;
                margin-bottom: 10px;
                animation: pulse 2s infinite;
            }
            
            .gif-placeholder .animation-text {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            .gif-display {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .bisindo-gif {
                max-width: 90%;
                max-height: 80%;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: fadeInScale 0.5s ease-out;
            }
            
            .gesture-label {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 0.9rem;
                animation: slideUp 0.5s ease-out 0.3s both;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes fadeInScale {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1); 
                }
            }
            
            @keyframes slideUp {
                0% { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(20px); 
                }
                100% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0); 
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Handle resize
    resize(width, height) {
        // Simple resize handling - animations are responsive by default
        console.log('Animation resized to:', width, 'x', height);
    }
}

export default SimpleAnimation;