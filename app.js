document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://back-end-santiago.onrender.com';
    let verifiedAppointment = null;

    // Verify Appointment - Updated with better error handling
    document.getElementById('verifyAppointmentBtn').addEventListener('click', async function() {
        const apptId = document.getElementById('appointmentId').value.trim();
        const verifyBtn = this;
        
        if (!apptId) {
            showAlert('Error', 'Please enter the appointment ID', 'error');
            return;
        }
        
        try {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="spinner"></span> Verifying...';
            
            const response = await fetch(`${API_BASE_URL}/appointment/${apptId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                let errorMsg = 'Failed to verify appointment';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.detail || errorMsg;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            verifiedAppointment = data;
            displayAppointmentInfo(data);
            
        } catch (error) {
            console.error('Verification error:', error);
            verifiedAppointment = null;
            showAlert('Error', error.message, 'error');
            document.getElementById('appointmentInfo').textContent = '';
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    });

    function displayAppointmentInfo(appointment) {
        // ... (keep your existing display logic)
    }

    // Form submission with retry logic
    document.getElementById('imagingStudyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        
        if (!verifiedAppointment) {
            showAlert('Error', 'Please verify the appointment first', 'error');
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            
            const imagingStudyData = {
                // ... (keep your existing data structure)
            };
            
            // Try the request with a retry mechanism
            const response = await fetchWithRetry(
                `${API_BASE_URL}/imagingstudy`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(imagingStudyData)
                },
                3  // Retry 3 times
            );
            
            const data = await response.json();
            showAlert('Success', 'Imaging Study created successfully', 'success');
            resetForm();
            
        } catch (error) {
            console.error('Submission error:', error);
            showAlert('Error', error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="button-text">Create Imaging Study</span>';
        }
    });

    // Helper function with retry logic
    async function fetchWithRetry(url, options, retries = 3) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            if (retries <= 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return fetchWithRetry(url, options, retries - 1);
        }
    }

    function resetForm() {
        // ... (keep your existing reset logic)
    }

    function showAlert(title, text, icon) {
        // ... (keep your existing alert logic)
    }
});