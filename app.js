// app.js
document.getElementById('imagingStudyForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const status = document.getElementById('status').value;
    const modalitySystem = document.getElementById('modalitySystem').value;
    const modalityCode = document.getElementById('modalityCode').value;
    const subjectReference = document.getElementById('subjectReference').value;
    const startedDateTime = document.getElementById('startedDateTime').value;
    const seriesUid = document.getElementById('seriesUid').value;
    const instanceUid = document.getElementById('instanceUid').value;
    const sopClassSystem = document.getElementById('sopClassSystem').value;
    const sopClassCode = document.getElementById('sopClassCode').value;

    // Create ImagingStudy object following the FHIR structure
    const imagingStudy = {
        "resourceType": "ImagingStudy",
        "id": "example-radiology",
        "identifier": [{
            "system": identifierSystem || "urn:dicom:uid",
            "value": identifierValue || "urn:oid:2.16.124.113543.6003.1154777499.30246.19789.3503430045"
        }],
        "status": status || "available",
        "modality": [{
            "coding": [{
                "system": modalitySystem || "http://dicom.nema.org/resources/ontology/DCM",
                "code": modalityCode || "CT"
            }]
        }],
        "subject": {
            "reference": subjectReference || "Patient/example"
        },
        "started": startedDateTime || "2021-01-01T09:00:00Z",
        "series": [{
            "uid": seriesUid || "2.16.124.113543.6003.1154777499.30246.19789.3503430045.1",
            "modality": {
                "coding": [{
                    "system": modalitySystem || "http://dicom.nema.org/resources/ontology/DCM",
                    "code": modalityCode || "CT"
                }]
            },
            "instance": [{
                "uid": instanceUid || "2.16.124.113543.6003.1154777499.30246.19789.3503430045.1.1",
                "sopClass": {
                    "system": sopClassSystem || "urn:ietf:rfc:3986",
                    "code": sopClassCode || "urn:oid:1.2.840.10008.5.1.4.1.1.2"
                }
            }]
        }]
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
        alert('Imaging study registered successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error registering imaging study.');
    });
});