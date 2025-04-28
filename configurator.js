document.addEventListener('DOMContentLoaded', function() {
    const configurator = document.querySelector('.configurator');
    if (!configurator) return;
    
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.configurator-content');
    const prevButton = document.querySelector('.config-button.prev');
    const nextButton = document.querySelector('.config-button.next');
    
    let currentStep = 0;
    
    // Configuration storage object
    const config = {
        force: 1500,        // Default force 1500 N
        length: 100,        // Default length 100 mm
        connection: null,   // Electrical connection type
        mounting: null,     // Mechanical mounting type
    };
    
    // Initialize configurator
    function initConfigurator() {
        // Set up step navigation
        updateStepVisibility();
        
        // Add event listeners for navigation buttons
        prevButton?.addEventListener('click', goToPreviousStep);
        nextButton?.addEventListener('click', goToNextStep);
        
        // Set up option selection
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                // Deselect all options in the same group
                const parentGroup = this.closest('.option-group');
                parentGroup.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Select this option
                this.classList.add('selected');
                
                // Store the selection in config object
                storeSelection(currentStep, this.textContent);
            });
        });
    }
    
    // Store the user's selection based on current step
    function storeSelection(step, value) {
        switch(step) {
            case 0: // Force
                config.force = parseInt(value.replace(/[^0-9]/g, ''));
                break;
            case 1: // Length
                config.length = parseInt(value.replace(/[^0-9]/g, ''));
                break;
            case 2: // Electrical connection
                config.connection = value;
                break;
            case 3: // Mounting
                config.mounting = value;
                break;
        }
        
        // Enable next button when a selection is made
        nextButton.disabled = false;
    }
    
    // Update step visibility
    function updateStepVisibility() {
        // Update steps indicator
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update content visibility
        contents.forEach((content, index) => {
            if (index === currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Update button states
        prevButton.disabled = currentStep === 0;
        
        // If this is the last step, change next button text
        if (currentStep === steps.length - 1) {
            nextButton.textContent = 'Fertigstellen';
        } else {
            nextButton.textContent = 'Weiter';
        }
    }
    
    // Go to previous step
    function goToPreviousStep() {
        if (currentStep > 0) {
            currentStep--;
            updateStepVisibility();
        }
    }
    
    // Go to next step
    function goToNextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateStepVisibility();
            
            // For the last step (summary), generate the summary content
            if (currentStep === steps.length - 1) {
                generateSummary();
            }
        } else {
            // This is the last step, submit configuration
            submitConfiguration();
        }
    }
    
    // Generate summary for the final step
    function generateSummary() {
        const summaryStep = contents[contents.length - 1];
        if (!summaryStep) return;
        
        // Create summary content
        let summaryHTML = `
            <div class="summary-container">
                <h3>Ihre Konfiguration</h3>
                <div class="summary-item">
                    <div class="summary-label">Maximalkraft:</div>
                    <div class="summary-value">${config.force} N</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Grundlänge:</div>
                    <div class="summary-value">${config.length} mm</div>
                </div>
        `;
        
        // Add connection and mounting if selected
        if (config.connection) {
            summaryHTML += `
      
                <div class="summary-item">
                    <div class="summary-label">Elektrischer Anschluss:</div>
                    <div class="summary-value">${config.connection}</div>
                </div>
            `;
        }
        
        if (config.mounting) {
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">Mechanische Einbauvariante:</div>
                    <div class="summary-value">${config.mounting}</div>
                </div>
            `;
        }
        
        // Add product code and estimated price
        const productCode = generateProductCode();
        
        summaryHTML += `
                <div class="summary-item product-code">
                    <div class="summary-label">Produktcode:</div>
                    <div class="summary-value">${productCode}</div>
                </div>
                <div class="summary-cta">
                    <button class="cta-button summary-download">Spezifikation herunterladen</button>
                    <button class="cta-button summary-request">Angebot anfordern</button>
                </div>
            </div>
        `;
        
        // Update the summary step content
        summaryStep.innerHTML = summaryHTML;
        
        // Add event listeners for the summary buttons
        summaryStep.querySelector('.summary-download')?.addEventListener('click', downloadSpecification);
        summaryStep.querySelector('.summary-request')?.addEventListener('click', requestQuote);
    }
    
    // Generate a product code based on configuration
    function generateProductCode() {
        const forceCode = (config.force / 500).toString().padStart(2, '0');
        const lengthCode = (config.length / 10).toString().padStart(2, '0');
        
        let connectionCode = '00';
        if (config.connection === 'Standard-Steckverbinder') connectionCode = '01';
        else if (config.connection === 'Kabelanschluss') connectionCode = '02';
        else if (config.connection === 'Spezialadapter') connectionCode = '03';
        
        let mountingCode = '00';
        if (config.mounting === 'Standardflansch') mountingCode = '01';
        else if (config.mounting === 'Spezialhalterung') mountingCode = '02';
        else if (config.mounting === 'Universal-Befestigung') mountingCode = '03';
        else if (config.mounting === 'Kundenspezifische Lösung') mountingCode = '99';
        
        return `PB-${forceCode}-${lengthCode}-${connectionCode}-${mountingCode}`;
    }
    
    // Download specification function (simulation)
    function downloadSpecification() {
        alert('Ihre Spezifikation wird generiert und zum Download vorbereitet...');
        // In a real implementation, this would generate and download a PDF
    }
    
    // Request quote function
    function requestQuote() {
        const contactForm = document.querySelector('#kontakt form');
        if (contactForm) {
            // Scroll to contact form
            contactForm.scrollIntoView({ behavior: 'smooth' });
            
            // Pre-fill subject with product code
            const subjectField = contactForm.querySelector('#contact-subject');
            if (subjectField) {
                subjectField.value = `Angebotsanfrage für ${generateProductCode()}`;
            }
            
            // Pre-fill message with configuration details
            const messageField = contactForm.querySelector('#contact-message');
            if (messageField) {
                messageField.value = `Ich möchte ein Angebot für folgende Konfiguration:\n\n` +
                    `- Maximalkraft: ${config.force} N\n` +
                    `- Grundlänge: ${config.length} mm\n` +
                    (config.connection ? `- Elektrischer Anschluss: ${config.connection}\n` : '') +
                    (config.mounting ? `- Mechanische Einbauvariante: ${config.mounting}\n` : '') +
                    `\nBitte senden Sie mir ein Angebot für diese Konfiguration zu.`;
            }
        }
    }
    
    // Submit the complete configuration
    function submitConfiguration() {
        alert('Vielen Dank für Ihre Konfiguration! Ihre Anfrage wurde gesendet.');
        // Reset the configurator
        currentStep = 0;
        updateStepVisibility();
    }
    
    // Create missing steps if needed
    function createMissingSteps() {
        // Step 2: Length
        if (!document.getElementById('step-2')) {
            const lengthStep = document.createElement('div');
            lengthStep.id = 'step-2';
            lengthStep.className = 'configurator-content';
            lengthStep.innerHTML = `
                <div class="option-group">
                    <h3>Wählen Sie die gewünschte Grundlänge</h3>
                    <div class="options">
                        <div class="option">80 mm</div>
                        <div class="option selected">100 mm</div>
                        <div class="option">120 mm</div>
                        <div class="option">150 mm</div>
                        <div class="option">180 mm</div>
                        <div class="option">200 mm</div>
                    </div>
                </div>
            `;
            const step1 = document.getElementById('step-1');
            if (step1) {
                step1.after(lengthStep);
            }
        }
        
        // Step 3: Electrical connection
        if (!document.getElementById('step-3')) {
            const connectionStep = document.createElement('div');
            connectionStep.id = 'step-3';
            connectionStep.className = 'configurator-content';
            connectionStep.innerHTML = `
                <div class="option-group">
                    <h3>Wählen Sie den elektrischen Anschluss</h3>
                    <div class="options">
                        <div class="option">Standard-Steckverbinder</div>
                        <div class="option">Kabelanschluss</div>
                        <div class="option">Spezialadapter</div>
                    </div>
                </div>
            `;
            const step2 = document.getElementById('step-2');
            if (step2) {
                step2.after(connectionStep);
            }
        }
        
        // Step 4: Mechanical mounting
        if (!document.getElementById('step-4')) {
            const mountingStep = document.createElement('div');
            mountingStep.id = 'step-4';
            mountingStep.className = 'configurator-content';
            mountingStep.innerHTML = `
                <div class="option-group">
                    <h3>Wählen Sie die mechanische Einbauvariante</h3>
                    <div class="options">
                        <div class="option">Standardflansch</div>
                        <div class="option">Spezialhalterung</div>
                        <div class="option">Universal-Befestigung</div>
                        <div class="option">Kundenspezifische Lösung</div>
                    </div>
                </div>
            `;
            const step3 = document.getElementById('step-3');
            if (step3) {
                step3.after(mountingStep);
            }
        }
        
        // Step 5: Summary
        if (!document.getElementById('step-5')) {
            const summaryStep = document.createElement('div');
            summaryStep.id = 'step-5';
            summaryStep.className = 'configurator-content';
            summaryStep.innerHTML = `<div class="summary-container">Laden...</div>`;
            const step4 = document.getElementById('step-4');
            if (step4) {
                step4.after(summaryStep);
            }
        }
        
        // Update contents collection
        contents = document.querySelectorAll('.configurator-content');
    }
    
    // Add CSS for summary styling if needed
    function addSummaryStyling() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .summary-container {
                padding: 1rem 0;
            }
            
            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--gray-lightest);
            }
            
            .summary-label {
                font-weight: 500;
            }
            
            .product-code {
                margin-top: 1rem;
                padding: 1rem 0;
                font-size: 1.2rem;
                font-weight: 700;
                border-bottom: 2px solid var(--mayr-blue);
            }
            
            .summary-cta {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                justify-content: flex-end;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Initialize interactive elements in configurator
    createMissingSteps();
    addSummaryStyling();
    initConfigurator();
});
