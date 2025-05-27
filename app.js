// Controlador principal del formulario
        document.addEventListener('DOMContentLoaded', function() {
            const formularioEstudio = document.getElementById('imagingStudyForm');
            const tituloFormulario = document.getElementById('form-title');
            
            if (formularioEstudio) {
                formularioEstudio.addEventListener('submit', manejarEnvioFormulario);
                
                // Configurar manejo de errores de validación
                formularioEstudio.querySelectorAll('[required]').forEach(campo => {
                    campo.addEventListener('invalid', manejarValidacion);
                    campo.addEventListener('input', limpiarError);
                });
            }

            function manejarValidacion(evento) {
                evento.preventDefault();
                const campo = evento.target;
                const mensaje = obtenerMensajeError(campo);
                mostrarError(campo, mensaje);
            }

            function obtenerMensajeError(campo) {
                if (campo.validity.valueMissing) {
                    return `El campo ${campo.labels[0].textContent.replace(' *', '')} es requerido`;
                }
                return 'Por favor complete este campo correctamente';
            }

            function mostrarError(campo, mensaje) {
                const grupo = campo.closest('.grupo-formulario');
                let elementoError = grupo.querySelector('.error-mensaje');
                
                if (!elementoError) {
                    elementoError = document.createElement('p');
                    elementoError.className = 'error-mensaje';
                    elementoError.style.color = '#e74c3c';
                    elementoError.style.marginTop = '5px';
                    elementoError.style.fontSize = '0.9em';
                    grupo.appendChild(elementoError);
                }
                
                elementoError.textContent = mensaje;
                campo.setAttribute('aria-invalid', 'true');
                tituloFormulario.textContent = `Error: ${mensaje}`;
            }

            function limpiarError(evento) {
                const campo = evento.target;
                campo.removeAttribute('aria-invalid');
                const grupo = campo.closest('.grupo-formulario');
                const elementoError = grupo.querySelector('.error-mensaje');
                if (elementoError) {
                    elementoError.remove();
                }
                tituloFormulario.textContent = 'Registro de Estudio de Imagenología';
            }

            async function manejarEnvioFormulario(evento) {
                evento.preventDefault();
                const formulario = evento.target;
                const botonEnviar = formulario.querySelector('button[type="submit"]');
                const textoOriginal = botonEnviar.innerHTML;
                
                try {
                    // Validación inicial
                    if (!formulario.checkValidity()) {
                        formulario.reportValidity();
                        return;
                    }

                    // Estado de carga
                    botonEnviar.disabled = true;
                    botonEnviar.innerHTML = '<span class="spinner"></span> Procesando...';
                    tituloFormulario.textContent = 'Registrando estudio de imagen...';

                    // Obtener datos del formulario
                    const datosEstudio = {
                        identifierSystem: document.getElementById('identifierSystem').value.trim(),
                        identifierValue: document.getElementById('identifierValue').value.trim(),
                        status: document.getElementById('status').value,
                        modality: document.getElementById('modality').value,
                        subjectReference: document.getElementById('subjectReference').value.trim(),
                        studyDate: document.getElementById('studyDate').value,
                        seriesUid: document.getElementById('seriesUid').value.trim(),
                        instanceUid: document.getElementById('instanceUid').value.trim(),
                        sopClassCode: document.getElementById('sopClassCode').value.trim()
                    };

                    // Crear objeto ImagingStudy FHIR
                    const imagingStudy = {
                        resourceType: "ImagingStudy",
                        identifier: [{
                            system: datosEstudio.identifierSystem,
                            value: datosEstudio.identifierValue
                        }],
                        status: datosEstudio.status,
                        modality: [{
                            coding: [{
                                system: "http://dicom.nema.org/resources/ontology/DCM",
                                code: datosEstudio.modality
                            }]
                        }],
                        subject: {
                            reference: datosEstudio.subjectReference
                        },
                        started: datosEstudio.studyDate,
                        series: [{
                            uid: datosEstudio.seriesUid,
                            modality: {
                                coding: [{
                                    system: "http://dicom.nema.org/resources/ontology/DCM",
                                    code: datosEstudio.modality
                                }]
                            },
                            instance: [{
                                uid: datosEstudio.instanceUid,
                                sopClass: {
                                    system: "urn:ietf:rfc:3986",
                                    code: datosEstudio.sopClassCode
                                }
                            }]
                        }]
                    };

                    // Enviar al servidor
                    const respuesta = await fetch('https://back-end-santiago.onrender.com/imagingstudy', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(imagingStudy)
                    });

                    const datosRespuesta = await respuesta.json();
                    
                    if (!respuesta.ok) {
                        throw new Error(datosRespuesta.detail || datosRespuesta.message || 'Error en el servidor');
                    }

                    mostrarAlertaExito(datosRespuesta.id || 'Estudio registrado');
                    formulario.reset();
                    tituloFormulario.textContent = 'Estudio registrado exitosamente';
                    
                } catch (error) {
                    console.error('Error en el envío:', error);
                    mostrarAlertaError(error.message);
                    tituloFormulario.textContent = `Error: ${error.message}`;
                } finally {
                    botonEnviar.disabled = false;
                    botonEnviar.innerHTML = textoOriginal;
                }
            }

            // Funciones de UI
            function mostrarAlertaExito(mensaje) {
                mostrarAlerta(
                    'Registro Exitoso',
                    `Estudio de imagen registrado correctamente. ${mensaje ? 'ID: ' + mensaje : ''}`,
                    'success'
                );
            }

            function mostrarAlertaError(mensaje) {
                mostrarAlerta('Error', mensaje, 'error');
            }

            function mostrarAlerta(titulo, mensaje, tipo) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: titulo,
                        text: mensaje,
                        icon: tipo,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3498db'
                    });
                } else {
                    alert(`${titulo}\n\n${mensaje}`);
                }
            }
        });