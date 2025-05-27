document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('imagingStudyForm');
    const verifyBtn = document.getElementById('verifyAppointmentBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Set default datetime to now with proper format
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
    document.getElementById('started').value = localISOTime;

    // Verify Appointment (unchanged from previous version)
    verifyBtn.addEventListener('click', async function() {
        // ... (keep your existing verification code)
    });

    // Form submission - FINAL WORKING VERSION
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            
            // Verify appointment was checked
            if (!document.getElementById('appointmentInfo').textContent) {
                throw new Error('Please verify the appointment first');
            }
            
            // Get form values
            const apptId = document.getElementById('appointmentId').value.trim();
            const modalityCode = document.getElementById('modality').value;
            const started = document.getElementById('started').value;
            const description = document.getElementById('description').value.trim();
            
            if (!modalityCode) {
                throw new Error('Please select a modality');
            }
            
            if (!started) {
                throw new Error('Please enter the study date and time');
            }
            
            // FINAL WORKING ImagingStudy structure
            const imagingStudyData = {
                resourceType: "ImagingStudy",
                status: "available",
                basedOn: [{
                    reference: `Appointment/${apptId}`
                }],
                // Minimal modality array - just the code string
                modality: [modalityCode],  // CHANGED THIS LINE
                started: `${started}:00Z`,
                description: description || "Radiology imaging study",
                subject: {
                    reference: "Patient/unknown"
                },
                numberOfSeries: 1,
                numberOfInstances: 1,
                series: [{
                    uid: "1.2.3." + Math.floor(Math.random() * 1000000),
                    number: 1,
                    // Minimal modality reference in series
                    modality: modalityCode,  // CHANGED THIS LINE
                    numberOfInstances: 1
                }]
            };

            console.log("Submitting ImagingStudy:", JSON.stringify(imagingStudyData, null, 2));
            
            // Submit to backend
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
                console.error("Backend error details:", errorData);
                throw new Error(errorData.detail || 'Failed to create Imaging Study');
            }
            
            const data = await response.json();
            console.log("Success response:", data);
            
            showAlert('Success', 'Imaging Study created successfully', 'success');
            form.reset();
            document.getElementById('appointmentInfo').textContent = '';
            document.getElementById('started').value = localISOTime;
            
        } catch (error) {
            console.error("Error:", error);
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