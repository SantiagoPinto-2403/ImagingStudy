
        document.getElementById('imagingStudyForm').addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const identifierSystem = document.getElementById('identifierSystem').value;
            const identifierValue = document.getElementById('identifierValue').value;
            const status = document.getElementById('status').value;
            const modality = document.getElementById('modality').value;
            const subjectReference = document.getElementById('subjectReference').value;
            const studyDate = document.getElementById('studyDate').value;
            const seriesUid = document.getElementById('seriesUid').value;
            const instanceUid = document.getElementById('instanceUid').value;
            const sopClassCode = document.getElementById('sopClassCode').value;

            // Create ImagingStudy object with series and instance
            const imagingStudy = {
                resourceType: "ImagingStudy",
                identifier: [{
                    system: identifierSystem,
                    value: identifierValue
                }],
                status: status,
                modality: [{
                    coding: [{
                        system: "http://dicom.nema.org/resources/ontology/DCM",
                        code: modality
                    }]
                }],
                subject: {
                    reference: subjectReference
                },
                started: studyDate,
                series: [{
                    uid: seriesUid,
                    modality: {
                        coding: [{
                            system: "http://dicom.nema.org/resources/ontology/DCM",
                            code: modality
                        }]
                    },
                    instance: [{
                        uid: instanceUid,
                        sopClass: {
                            system: "urn:ietf:rfc:3986",
                            code: sopClassCode
                        }
                    }]
                }]
            };

            // Send to server
            fetch('https://back-end-santiago.onrender.com/imagingstudy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(imagingStudy)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Estudio de imagen registrado exitosamente!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error al registrar el estudio de imagen.');
            });
        });