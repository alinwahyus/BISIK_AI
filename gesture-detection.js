/**
 * Simple Hand Detection System for BISINDO
 * Simplified version to avoid WebAssembly memory issues
 */

class GestureDetection {
    constructor() {
        this.camera = null;
        this.isDetecting = false;
        this.onGestureDetected = null;
        this.videoElement = null;
        this.canvas = null;
        this.ctx = null;
        this.detectionInterval = null;
    }

    // Initialize simple camera access without MediaPipe
    async initializeCamera() {
        try {
            console.log('📹 Initializing simple camera...');
            
            this.videoElement = document.getElementById('gesture-camera');
            if (!this.videoElement) {
                throw new Error('Camera video element not found');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            console.log('✅ Simple camera initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize camera:', error);
            return false;
        }
    }

    // Enhanced hand detection with face filtering
    detectHands() {
        if (!this.videoElement || !this.canvas || !this.ctx) return;

        try {
            // Draw video frame to canvas
            this.canvas.width = this.videoElement.videoWidth || 640;
            this.canvas.height = this.videoElement.videoHeight || 480;
            
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data for analysis
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            let skinPixels = 0;
            let totalPixels = 0;
            let handRegions = [];
            
            // Analyze image in blocks for better performance
            const blockSize = 8; // Slightly larger blocks for better performance
            
            for (let y = 0; y < this.canvas.height; y += blockSize) {
                for (let x = 0; x < this.canvas.width; x += blockSize) {
                    const index = (y * this.canvas.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    totalPixels++;
                    
                    if (this.isSkinColor(r, g, b)) {
                        skinPixels++;
                        handRegions.push({
                            x: x,
                            y: y,
                            intensity: (r + g + b) / 3,
                            confidence: this.calculatePixelConfidence(r, g, b)
                        });
                    }
                }
            }
            
            const skinRatio = skinPixels / totalPixels;
            
            // Filter out face regions - hands are typically in lower 2/3 of frame
            const filteredHandRegions = this.filterHandRegions(handRegions, this.canvas.width, this.canvas.height);
            
            // Enhanced hand detection logic with improved sensitivity
            const isHandDetected = skinRatio > 0.04 && // Reduced from 0.06 for better sensitivity
                                  filteredHandRegions.length > 6 && // Reduced from 10 for better sensitivity
                                  filteredHandRegions.length / handRegions.length > 0.3 && // Reduced from 0.4 for better sensitivity
                                  this.isHandShape(filteredHandRegions, this.canvas.width, this.canvas.height);
            const confidence = Math.min(skinRatio * 12, 0.95); // Increased multiplier and max confidence
            
            // Estimate gesture based on filtered hand regions
            let gesture = 'UNKNOWN';
            if (isHandDetected) {
                gesture = this.estimateGesture(filteredHandRegions, this.canvas.width, this.canvas.height);
            }
            
            // If hand detected, trigger callback
            if (isHandDetected && this.onGestureDetected) {
                this.onGestureDetected({
                    gesture: gesture,
                    confidence: confidence,
                    handRegions: filteredHandRegions.length,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Error in hand detection:', error);
        }
    }

    // Filter hand regions to exclude face area - MUCH MORE AGGRESSIVE
    filterHandRegions(regions, width, height) {
        const faceArea = {
            top: 0,
            bottom: height * 0.65, // Upper 65% is likely face/neck area - INCREASED
            left: width * 0.15,    // Center 70% horizontally - EXPANDED
            right: width * 0.85
        };
        
        // STRICT hand area - only bottom corners and lower sides
        const handAreas = [
            // Bottom left corner
            { minX: 0, maxX: width * 0.4, minY: height * 0.6, maxY: height },
            // Bottom right corner  
            { minX: width * 0.6, maxX: width, minY: height * 0.6, maxY: height },
            // Lower left side
            { minX: 0, maxX: width * 0.25, minY: height * 0.4, maxY: height * 0.8 },
            // Lower right side
            { minX: width * 0.75, maxX: width, minY: height * 0.4, maxY: height * 0.8 }
        ];
        
        // Filter regions - ONLY keep those in designated hand areas
        return regions.filter(region => {
            // First exclude face area completely
            if (region.y < faceArea.bottom && 
                region.x > faceArea.left && 
                region.x < faceArea.right) {
                return false;
            }
            
            // Then only keep regions in specific hand areas
            return handAreas.some(area => 
                region.x >= area.minX && region.x <= area.maxX &&
                region.y >= area.minY && region.y <= area.maxY
            );
        });
    }

    // Check if regions form a hand-like shape - MUCH STRICTER
    isHandShape(regions, width, height) {
        if (regions.length < 8) return false; // Increased minimum regions
        
        // Calculate region distribution
        const centerX = width / 2;
        const centerY = height / 2;
        
        let bottomRegions = 0;
        let cornerRegions = 0;
        let sideRegions = 0;
        let compactness = 0;
        
        // Analyze region distribution - STRICTER CRITERIA
        for (const region of regions) {
            // Count regions in LOWER part (hands are typically in bottom 40%)
            if (region.y > height * 0.6) {
                bottomRegions++;
            }
            
            // Count regions in CORNERS (hands are in corners, not center)
            if ((region.x < width * 0.3 && region.y > height * 0.5) || 
                (region.x > width * 0.7 && region.y > height * 0.5)) {
                cornerRegions++;
            }
            
            // Count regions on EXTREME sides (hands move to far sides)
            if (region.x < width * 0.25 || region.x > width * 0.75) {
                sideRegions++;
            }
        }
        
        // Calculate compactness (hands are more compact than faces)
        const avgX = regions.reduce((sum, r) => sum + r.x, 0) / regions.length;
        const avgY = regions.reduce((sum, r) => sum + r.y, 0) / regions.length;
        
        let totalDistance = 0;
        for (const region of regions) {
            totalDistance += Math.sqrt(Math.pow(region.x - avgX, 2) + Math.pow(region.y - avgY, 2));
        }
        compactness = totalDistance / regions.length;
        
        // VERY STRICT hand characteristics:
        // - MOST regions in bottom 40%
        // - SIGNIFICANT regions in corners
        // - MANY regions on extreme sides
        // - COMPACT distribution
        const bottomRatio = bottomRegions / regions.length;
        const cornerRatio = cornerRegions / regions.length;
        const sideRatio = sideRegions / regions.length;
        
        return bottomRatio > 0.6 &&    // At least 60% in bottom (was 40%)
               cornerRatio > 0.3 &&    // At least 30% in corners (NEW)
               sideRatio > 0.4 &&      // At least 40% on sides (was 20%)
               compactness < width * 0.2; // More compact (was 0.3)
    }

    // Calculate confidence for individual pixels
    calculatePixelConfidence(r, g, b) {
        // Calculate confidence based on how well the pixel matches skin color
        const skinScore = Math.min(r / 255, 1) * 0.4 + 
                         Math.min(g / 255, 1) * 0.3 + 
                         Math.min(b / 255, 1) * 0.3;
        return Math.min(skinScore, 0.95);
    }

    // Improved gesture estimation with better sensitivity
    estimateGesture(handRegions, width, height) {
        // Improved logic: lower threshold for better sensitivity
        if (handRegions.length >= 3) { // Reduced from 5 for better sensitivity
            return 'MEREKA'; // Any detected hand is classified as MEREKA
        }
        return 'UNKNOWN';
    }

    // Enhanced skin color detection with multiple tone ranges
    isSkinColor(r, g, b) {
        // Multiple skin tone ranges for better detection
        const skinRanges = [
            // Light skin tones
            {rMin: 95, rMax: 255, gMin: 40, gMax: 100, bMin: 20, bMax: 95},
            // Medium skin tones  
            {rMin: 80, rMax: 220, gMin: 50, gMax: 150, bMin: 30, bMax: 120},
            // Dark skin tones
            {rMin: 45, rMax: 255, gMin: 34, gMax: 200, bMin: 14, bMax: 180}
        ];
        
        for (const range of skinRanges) {
            if (r >= range.rMin && r <= range.rMax &&
                g >= range.gMin && g <= range.gMax &&
                b >= range.bMin && b <= range.bMax) {
                
                // Additional YCbCr color space check for better accuracy
                const y = 0.299 * r + 0.587 * g + 0.114 * b;
                const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
                const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
                
                // Skin color in YCbCr space
                if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Start simple detection
    async startDetection() {
        console.log('🚀 Starting simple hand detection...');
        
        const cameraInitialized = await this.initializeCamera();
        if (!cameraInitialized) {
            throw new Error('Failed to initialize camera');
        }

        // Create canvas for image processing
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.isDetecting = true;
        
        // Start detection loop
        this.detectionInterval = setInterval(() => {
            if (this.isDetecting) {
                this.detectHands();
            }
        }, 500); // Check every 500ms to reduce load

        console.log('✅ Simple hand detection started');
    }

    // Stop detection
    stopDetection() {
        console.log('⏹️ Stopping hand detection...');
        this.isDetecting = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Stop camera stream
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        console.log('✅ Hand detection stopped');
    }

    // Set callback for detection
    setGestureCallback(callback) {
        this.onGestureDetected = callback;
    }
}

export default GestureDetection;