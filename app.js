document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('imagingStudyForm');
        const verifyBtn = document.getElementById('verifyAppointmentBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // Set default datetime to now
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
        document.getElementById('started').value = localISOTime;

        // Verify Appointment
        verifyBtn.addEventListener('click', async function() {
            const apptId = document.getElementById('appointmentId').value.trim();
            
            if (!apptId) {
                showAlert('Error', 'Por favor ingrese el ID de la cita', 'error');
                return;
            }
            
            try {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<span class="spinner"></span> Verificando...';
                document.getElementById('appointmentInfo').textContent = 'Verificando cita...';
                
                const response = await fetch(`https://back-end-santiago.onrender.com/appointment/${apptId}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.detail || 'No se encontró la cita');
                }
                
                // Display appointment info
                const patientRef = data.participant?.find(p => p.actor?.reference?.startsWith('Patient/'))?.actor?.reference || 'Paciente no especificado';
                const statusMap = {
                    'booked': 'Agendada',
                    'arrived': 'Paciente presente',
                    'fulfilled': 'Completada',
                    'cancelled': 'Cancelada'
                };
                
                const status = statusMap[data.status] || data.status || 'Estado desconocido';
                const startTime = data.start ? new Date(data.start).toLocaleString() : 'No especificada';
                
                document.getElementById('appointmentInfo').innerHTML = `
                    <strong>Cita verificada</strong><br>
                    ${patientRef}<br>
                    Estado: ${status}<br>
                    Fecha: ${startTime}
                `;
                
            } catch (error) {
                showAlert('Error', error.message, 'error');
                document.getElementById('appointmentInfo').textContent = '';
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verificar';
            }
        });

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Registrando...';
                
                // Verify appointment was checked
                if (!document.getElementById('appointmentInfo').textContent) {
                    throw new Error('Por favor verifique la cita primero');
                }
                
                // Get form values
                const apptId = document.getElementById('appointmentId').value.trim();
                const modality = document.getElementById('modality').value;
                const started = document.getElementById('started').value;
                const description = document.getElementById('description').value.trim();
                
                if (!modality) {
                    throw new Error('Por favor seleccione una modalidad');
                }
                
                if (!started) {
                    throw new Error('Por favor ingrese la fecha y hora del estudio');
                }
                
                // Build imaging study object
                const imagingStudyData = {
                    resourceType: "ImagingStudy",
                    status: "available",
                    basedOn: [{
                        reference: `Appointment/${apptId}`
                    }],
                    modality: [{
                        code: modality
                    }],
                    started: `${started}:00Z`,
                    description: description || "Estudio de imagen radiológico",
                    subject: {
                        reference: "Patient/unknown"
                    },
                    numberOfSeries: 1,
                    numberOfInstances: 1,
                    series: [{
                        uid: "1.2.3." + Math.floor(Math.random() * 1000000),
                        number: 1,
                        numberOfInstances: 1,
                        modality: {
                            code: modality
                        }
                    }]
                };
                
                // Submit to backend
                const response = await fetch('https://back-end-santiago.onrender.com/imagingstudy', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(imagingStudyData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.detail || 'Error al registrar el estudio');
                }
                
                showAlert('Éxito', 'Estudio registrado correctamente', 'success');
                form.reset();
                document.getElementById('appointmentInfo').textContent = '';
                document.getElementById('started').value = localISOTime;
                
            } catch (error) {
                showAlert('Error', error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="button-text">Registrar Estudio</span>';
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