document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('imagingStudyForm');
    const verifyBtn = document.getElementById('verifyAppointmentBtn');
    const submitBtn = document.getElementById('submitBtn');
    const appointmentIdInput = document.getElementById('appointmentId');
    const appointmentInfoDiv = document.getElementById('appointmentInfo');
    
    // Set default datetime to now with proper format
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
    document.getElementById('started').value = localISOTime;

    // Verify Appointment - WORKING VERSION
    verifyBtn.addEventListener('click', async function() {
        const apptId = appointmentIdInput.value.trim();
        
        if (!apptId) {
            showAlert('Error', 'Please enter the appointment ID', 'error');
            return;
        }
        
        try {
            // Show loading state
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="spinner"></span> Verifying...';
            appointmentInfoDiv.textContent = 'Verifying appointment...';
            
            // Call backend API
            const response = await fetch(`https://back-end-santiago.onrender.com/appointment/${apptId}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to verify appointment');
            }
            
            const appointmentData = await response.json();
            
            // Validate response
            if (!appointmentData || appointmentData.resourceType !== 'Appointment') {
                throw new Error('Invalid appointment data received');
            }
            
            // Extract patient information
            const patientParticipant = appointmentData.participant?.find(
                p => p.actor?.reference?.startsWith('Patient/')
            );
            const patientRef = patientParticipant?.actor?.reference || 'Patient/unknown';
            const patientId = patientRef.split('/')[1] || 'Unknown';
            
            // Display appointment information
            appointmentInfoDiv.innerHTML = `
                <strong>Verified Appointment</strong><br>
                Patient ID: ${patientId}<br>
                Status: ${appointmentData.status || 'unknown'}<br>
                Date: ${appointmentData.start ? new Date(appointmentData.start).toLocaleString() : 'Not specified'}
            `;
            
        } catch (error) {
            console.error('Verification failed:', error);
            appointmentInfoDiv.textContent = '';
            showAlert('Verification Failed', error.message, 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    });

    // Form submission - FINAL WORKING VERSION
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Validate appointment was verified
            if (!appointmentInfoDiv.textContent || 
                appointmentInfoDiv.textContent.includes('Verifying') ||
                appointmentInfoDiv.textContent.includes('Failed')) {
                throw new Error('Please verify the appointment first');
            }
            
            // Get form values
            const apptId = appointmentIdInput.value.trim();
            const modalityCode = document.getElementById('modality').value;
            const started = document.getElementById('started').value;
            const description = document.getElementById('description').value.trim();
            
            // Validate inputs
            if (!modalityCode) throw new Error('Please select a modality');
            if (!started) throw new Error('Please enter the study date and time');
            
            // Prepare ImagingStudy data - CORRECT MODALITY STRUCTURE
            const imagingStudyData = {
                resourceType: "ImagingStudy",
                status: "available",
                basedOn: [{
                    reference: `Appointment/${apptId}`
                }],
                // Correct modality structure - simple string in array
                modality: [modalityCode],
                started: `${started}:00Z`,
                description: description || "Radiology imaging study",
                subject: {
                    reference: "Patient/unknown"
                },
                numberOfSeries: 1,
                numberOfInstances: 1,
                // Correct series modality structure - simple string
                series: [{
                    uid: "1.2.3." + Math.floor(Math.random() * 1000000),
                    number: 1,
                    modality: modalityCode,
                    numberOfInstances: 1
                }]
            };

            console.log("Submitting ImagingStudy:", JSON.stringify(imagingStudyData, null, 2));
            
            // Submit to backend
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Creating...';
            
            const response = await fetch('https://back-end-santiago.onrender.com/imagingstudy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(imagingStudyData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to create imaging study');
            }
            
            const result = await response.json();
            showAlert('Success', 'Imaging study created successfully!', 'success');
            
            // Reset form
            form.reset();
            appointmentInfoDiv.textContent = '';
            document.getElementById('started').value = localISOTime;
            
        } catch (error) {
            console.error('Submission failed:', error);
            showAlert('Error', error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="button-text">Create Imaging Study</span>';
        }
    });
    
    // Alert helper function
    function showAlert(title, text, icon) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: text,
                icon: icon,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3498db'
            });
        } else {
            alert(`${title}\n\n${text}`);
        }
    }
});