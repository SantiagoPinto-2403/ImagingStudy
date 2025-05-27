document.getElementById('imagingStudyForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formStatus = document.getElementById('formStatus');
    formStatus.textContent = '';
    formStatus.className = 'success';

    // Get form values
    const appointmentReference = document.getElementById('appointmentReference').value;
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const status = document.getElementById('status').value;
    const modality = document.getElementById('modality').value;
    const subjectReference = document.getElementById('subjectReference').value;
    const studyDate = document.getElementById('studyDate').value;
    const seriesUid = document.getElementById('seriesUid').value;
    const numberOfInstances = document.getElementById('numberOfInstances').value;
    const bodySite = document.getElementById('bodySite').value;

    // Validate appointment reference format
    if (!appointmentReference.startsWith('Appointment/')) {
        document.getElementById('appointmentError').textContent = 
            'La referencia debe comenzar con "Appointment/"';
        return;
    }

    // Create ImagingStudy object
    const imagingStudy = {
        resourceType: "ImagingStudy",
        identifier: [{
            system: identifierSystem,
            value: identifierValue
        }],
        status: status,
        basedOn: [{
            reference: appointmentReference,
            type: "Appointment"
        }],
        modality: [{
            coding: [{
                system: "http://dicom.nema.org/resources/ontology/DCM",
                code: modality,
                display: document.querySelector(`#modality option[value="${modality}"]`).text
            }]
        }],
        subject: {
            reference: subjectReference
        },
        started: studyDate,
        series: [{
            uid: seriesUid,
            number: 1,
            modality: {
                coding: [{
                    system: "http://dicom.nema.org/resources/ontology/DCM",
                    code: modality
                }]
            },
            numberOfInstances: parseInt(numberOfInstances)
        }]
    };

    // Add bodySite if provided
    if (bodySite) {
        const [code, display] = bodySite.split('|');
        imagingStudy.series[0].bodySite = {
            coding: [{
                system: "http://snomed.info/sct",
                code: code.trim(),
                display: display?.trim() || ''
            }]
        };
    }

    try {
        const response = await fetch('https://back-end-santiago.onrender.com/api/imaging-studies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(imagingStudy)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Error en el servidor');
        }

        console.log('Success:', data