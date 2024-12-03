// Initialize data arrays for storage
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let prescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];

// Function to save data to localStorage
function saveData() {
    localStorage.setItem("patients", JSON.stringify(patients));
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions));
    localStorage.setItem("bills", JSON.stringify(bills));
}

// Register Patient with additional details

function registerPatient() {
    const patient = {
        name: document.getElementById("patientName").value,
        age: document.getElementById("age").value,
        contact: document.getElementById("contact").value,
        address: document.getElementById("address").value,
        emergencyContact: document.getElementById("emergencyContact").value,
        gender: document.getElementById("gender").value,
        bloodType: document.getElementById("bloodType").value,
        allergies: document.getElementById("allergies").value,
        medicalHistory: document.getElementById("medicalHistory").value,
        currentMedications: document.getElementById("currentMedications").value,
        notes: document.getElementById("notes").value
    };

    let patients = JSON.parse(localStorage.getItem("patients")) || [];
    patients.push(patient);
    localStorage.setItem("patients", JSON.stringify(patients));

    alert("Patient registered successfully!");
    document.getElementById("registerForm").reset();
}
// Populate patient dropdowns for prescription and billing
function populatePatientSelects() {
    const patientSelect = document.getElementById("patientSelect");
    const billingPatientSelect = document.getElementById("billingPatientSelect");

    // Clear existing options
    patientSelect.innerHTML = billingPatientSelect.innerHTML = "";

    patients.forEach(patient => {
        const option = document.createElement("option");
        option.value = patient.id;
        option.textContent = patient.name;
        patientSelect.appendChild(option);
        billingPatientSelect.appendChild(option.cloneNode(true));
    });
}

// Prescription Generation
function generatePrescription() {
    const patientId = document.getElementById("patientSelect").value;
    const details = document.getElementById("prescriptionDetails").value;

    if (patientId && details) {
        prescriptions.push({ patientId, details, date: new Date().toLocaleString() });
        saveData();
		  
        alert("Prescription Generated!");
		
    }
	
}

function generateBill() {
   /* const patientName = document.getElementById("billingPatientSelect").value;*/
    const currency = document.getElementById("currency").value;
    const billAmount = document.getElementById("billAmount").value;
    const prescriptionDetails = document.getElementById("savedPrescriptionDetails").value;
let dropdown = document.getElementById("patientSelect");

	// Get the selected option
	let selectedOption = dropdown.options[dropdown.selectedIndex];

	// Get the text value of the selected option
	let patientName = selectedOption.text;
    if (!patientName || !billAmount) {
        alert("Please select a patient and enter the bill amount.");
        return;
    }

    // Create a timestamp for the file name
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);

    // Generate Bill PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Billing Invoice", 10, 10);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${patientName}`, 10, 20);
    doc.text(`Currency: ${currency}`, 10, 30);
    doc.text(`Amount: ${currency} ${billAmount}`, 10, 40);
    doc.text("Prescription Details:", 10, 50);
    doc.text(prescriptionDetails, 10, 60);

    doc.save(`bill_${patientName}_${timestamp}.pdf`);
    //alert("Bill generated and saved!");
}

// View Patient Details
function viewPatientDetails() {
    const output = document.getElementById("reportOutput");
    output.innerHTML = "";

    patients.forEach(patient => {
        const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id);
        const patientBills = bills.filter(b => b.patientId === patient.id);

        output.innerHTML += `<h3>${patient.name}</h3>`;
        output.innerHTML += `<p>Age: ${patient.age}, Contact: ${patient.contact}</p>`;

        output.innerHTML += "<h4>Prescriptions:</h4>";
        if (patientPrescriptions.length) {
            patientPrescriptions.forEach(p => {
                output.innerHTML += `<p>${p.date}: ${p.details}</p>`;
            });
        } else {
            output.innerHTML += "<p>No prescriptions found.</p>";
        }

        output.innerHTML += "<h4>Bills:</h4>";
        if (patientBills.length) {
            patientBills.forEach(b => {
                output.innerHTML += `<p>${b.date}: $${b.amount}</p>`;
            });
        } else {
            output.innerHTML += "<p>No bills found.</p>";
        }
    });
}

// Search Patient by Name
// Function to search for a patient by name
function searchPatient() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchInput)
    );
    displayPatientDetails(filteredPatients);

    // Show the "Export Details" button if results are found
    if (filteredPatients.length > 0) {
        document.getElementById("exportDetailsBtn").style.display = "inline-block";
    } else {
        document.getElementById("exportDetailsBtn").style.display = "none";
    }
}

// Function to display patient details in a 3-column grid
function displayPatientDetails(patients) {
    const container = document.getElementById("patientDetailsContainer");
    container.innerHTML = ""; // Clear previous details

    if (patients.length === 0) {
        container.innerHTML = "<p>No matching patient records found.</p>";
        return;
    }

    patients.forEach(patient => {
        for (const [key, value] of Object.entries(patient)) {
            const item = document.createElement("div");
            item.classList.add("patient-details-item");
            item.innerHTML = `<h4>${key.replace(/_/g, ' ').toUpperCase()}</h4><p>${value}</p>`;
            container.appendChild(item);
        }
    });
}

// Function to export patient details as PDF
function exportPatientDetails() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchInput)
    );

    if (filteredPatients.length > 0) {
        // Add Title to the PDF
        doc.setFontSize(16);
        doc.setTextColor(0, 51, 102);
        doc.text("Patient Details", 14, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Loop through the filtered patients and add their details
        let yOffset = 30;
        filteredPatients.forEach(patient => {
            doc.setFont("helvetica", "normal");
            for (const [key, value] of Object.entries(patient)) {
                doc.text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`, 14, yOffset);
                yOffset += 10;
                if (yOffset > 250) { // Check to avoid overflow
                    doc.addPage();
                    yOffset = 20;
                }
            }
            yOffset += 15;
        });

        // Save the PDF
        const date = new Date();
        const fileName = `Patient_Details_${date.toISOString().slice(0, 10)}_${date.toISOString().slice(11, 19).replace(/:/g, "-")}.pdf`;
        doc.save(fileName);
    }
}
// Load all patient details on page load

function showAllPatients() {

    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    displayPatientDetails(patients);
};

// Scroll smoothly to the specified section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

// Show only the selected section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(section => section.classList.remove("active"));

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add("active");
    }
}

// Existing functionality for registration, prescriptions, billing, and patient details here
// ...
// Generate a PDF for the prescription with a timestamp in the file name
function generatePrescriptionPDF() {
   
	let dropdown = document.getElementById("patientSelect");

	// Get the selected option
	let selectedOption = dropdown.options[dropdown.selectedIndex];

	// Get the text value of the selected option
	let patientName = selectedOption.text;
	

    const prescriptionDetails = document.getElementById("prescriptionDetails").value;

    if (!patientName || !prescriptionDetails) {
        alert("Please select a patient and enter prescription details.");
        return;
    }

    // Create a timestamp for the file name
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14); // Format: YYYYMMDDHHMMSS
	
	let Today = new Date();


	
	let year = Today.getFullYear();
let month = (Today.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
let day = Today.getDate().toString().padStart(2, "0");
let hours = Today.getHours().toString().padStart(2, "0");
let minutes = Today.getMinutes().toString().padStart(2, "0");
let seconds = Today.getSeconds().toString().padStart(2, "0");

let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	
	
    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
	
    doc.setFontSize(16);
	doc.setFont("helvetica", "bold");
    doc.text("Prescription", 10, 10);
    doc.setFontSize(12);
	
	doc.text(`Generated Datetime: `, 20, 20);
	doc.setFont("helvetica", "italics");
	doc.text(`${formattedDateTime}`, 80, 20);
	doc.setFont("helvetica", "bold");
    doc.text(`Patient Name:`, 20, 30);
	doc.setFont("helvetica", "italics");
	doc.text(`${patientName}`, 80, 30);
	doc.setFont("helvetica", "bold");
    doc.text("Prescription Details:", 20, 40);
	doc.setFont("helvetica", "italics");
    doc.text(prescriptionDetails, 80, 40);
	doc.setFont("helvetica", "bold");
	  doc.text("ODoc Consultant. E-Prescription", 10, 80);

    // Save PDF with timestamp in the filename
    doc.save(`prescription_${patientName}_${timestamp}.pdf`);
	
	copyPrescriptionDetails();
}

// Populate dropdowns on load
populatePatientSelects();

function copyPrescriptionDetails() {
	
    // Get the value of the prescription details textarea
    const prescriptionDetails = document.getElementById('prescriptionDetails').value;
    
    // Set the value of the savedPrescriptionDetails textarea
    document.getElementById('savedPrescriptionDetails').value = prescriptionDetails;
}
