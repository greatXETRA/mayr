document.addEventListener('DOMContentLoaded', function() {
    const fglElement = document.getElementById('fgl-element');
    const tempSlider = document.getElementById('temp-slider');
    
    if (!fglElement || !tempSlider) return;
    
    let isDragging = false;
    let barWidth = document.querySelector('.temperature-bar')?.offsetWidth || 200;
    let sliderPosition = 0;
    
    // Update animation based on slider position
    function updateFGLAnimation(position) {
        // Normalize position (0 to 1)
        const normalizedPosition = position / barWidth;
        
        // Calculate FGL contraction
        // At position 0 (left - "Raumtemperatur"): scale = 1 (fully extended)
        // At position barWidth (right - "erwärmt"): scale = 0.75 (contracted to 3/4)
        const scale = 1 - (normalizedPosition * 0.25);
        
        // Update element style
        fglElement.style.transform = `scaleX(${scale})`;
        
        // Change color to reflect temperature
        // From blue (cold) to red (hot) through a gradient
        const hue = 240 - (normalizedPosition * 240); // 240 (blue) to 0 (red)
        fglElement.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;
    }
    
    // Set up initial position (left - "Raumtemperatur")
    tempSlider.style.left = '0px';
    updateFGLAnimation(0);
    
    // Set up slider dragging
    tempSlider.addEventListener('mousedown', function(e) {
        isDragging = true;
        handleDrag(e);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            handleDrag(e);
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // Handle touch events for mobile
    tempSlider.addEventListener('touchstart', function(e) {
        isDragging = true;
        handleTouchDrag(e);
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            handleTouchDrag(e);
        }
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Mouse drag handler
    function handleDrag(e) {
        e.preventDefault();
        const tempBar = document.querySelector('.temperature-bar');
        if (!tempBar) return;
        
        const barRect = tempBar.getBoundingClientRect();
        let newPosition = e.clientX - barRect.left;
        
        // Constrain to bar boundaries
        newPosition = Math.max(0, Math.min(newPosition, barRect.width));
        
        // Update slider position
        tempSlider.style.left = newPosition + 'px';
        sliderPosition = newPosition;
        
        // Update animation
        updateFGLAnimation(newPosition);
    }
    
    // Touch drag handler
    function handleTouchDrag(e) {
        const tempBar = document.querySelector('.temperature-bar');
        if (!tempBar) return;
        
        const touch = e.touches[0];
        const barRect = tempBar.getBoundingClientRect();
        let newPosition = touch.clientX - barRect.left;
        
        // Constrain to bar boundaries
        newPosition = Math.max(0, Math.min(newPosition, barRect.width));
        
        // Update slider position
        tempSlider.style.left = newPosition + 'px';
        sliderPosition = newPosition;
        
        // Update animation
        updateFGLAnimation(newPosition);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const tempBar = document.querySelector('.temperature-bar');
        if (tempBar) {
            const oldBarWidth = barWidth;
            barWidth = tempBar.offsetWidth;
            
            // Recalculate slider position as percentage of new width
            const percentage = sliderPosition / oldBarWidth;
            sliderPosition = percentage * barWidth;
            tempSlider.style.left = sliderPosition + 'px';
            
            // Update animation
            updateFGLAnimation(sliderPosition);
        }
    });
});
