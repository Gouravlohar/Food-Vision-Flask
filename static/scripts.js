document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('uploadInput').addEventListener('change', function() {
        const fileName = this.files[0].name;
        document.getElementById('fileName').textContent = `Selected file: ${fileName}`;
    });

    document.getElementById('uploadForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Show loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'block';

        // Get the uploaded file
        const fileInput = document.getElementById('uploadInput');
        const uploadedFile = fileInput.files[0];

        // Display the uploaded image
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDisplay = document.getElementById('imageDisplay');
                imageDisplay.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
            };
            reader.readAsDataURL(uploadedFile);
        }

        // Submit form data to Flask backend
        const formData = new FormData();
        formData.append('uploadInput', uploadedFile);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';

            // Display response
            const responseOutput = document.getElementById('responseOutput');
            responseOutput.innerHTML = `
                <h2>The Response is</h2>
                <pre>${formatResponse(data.result)}</pre>
            `;

            // Display uploaded image
            const imageDisplay = document.getElementById('imageDisplay');
            imageDisplay.innerHTML = `<img src="data:image/jpeg;base64, ${data.image}" alt="Uploaded Image">`;
        })
        .catch(error => {
            console.error('Error:', error);
            // Hide loading indicator on error
            loadingIndicator.style.display = 'none';
        });
    });

    // Function to format response
    function formatResponse(response) {
        // Split response into lines
        const lines = response.split('\n');

        // Format each line
        const formattedLines = lines.map(line => {
            // Headers (assuming headers are lines starting with numbers followed by a period)
            if (/^\d+\./.test(line.trim())) {
                return `<h3>${line.trim()}</h3>`;
            }
            // Lists (assuming lists are lines starting with numbers or hyphens)
            else if (/^[\d-]+\./.test(line.trim())) {
                return `<li>${line.trim()}</li>`;
            }
            // Bold text (assuming bold text is surrounded by asterisks)
            else if (/\*{2}.*\*{2}/.test(line.trim())) {
                return `<b>${line.trim()}</b>`;
            }
            // Regular text
            else {
                return line.trim();
            }
        });

        // Join formatted lines back into a single string
        return formattedLines.join('<br>');
    }
});
