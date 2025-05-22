document.getElementById('imagingStudyForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const status = document.getElementById('status').value;
    const modality = document.getElementById('modality').value;
    const subjectReference = document.getElementById('subjectReference').value;
    const studyDate = document.getElementById('studyDate').value;

    // Create ImagingStudy object (date only, no time)
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
        started: studyDate // Just the date without time
    };

    // Send to server
    console.log("Sending ImagingStudy:", imagingStudy);
    
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