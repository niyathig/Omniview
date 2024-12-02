// pipeline.js

document.addEventListener('DOMContentLoaded', function() {
    displaySelectedCustomerPipeline();
});

async function displaySelectedCustomerPipeline() {
    try {
        // Retrieve the selected customer from storage
        chrome.storage.local.get(['selectedCustomer'], function(result) {
            const customer = result.selectedCustomer;
            if (customer) {
                displayCustomerInfo(customer);
                displayPipeline(customer.pipeline);
            } else {
                alert('No customer selected. Please choose a lead first.');
            }
        });
    } catch (error) {
        console.error('Error retrieving selected customer:', error);
        alert('Failed to load selected customer.');
    }
}

// Function to Display Customer Information
function displayCustomerInfo(customer) {
    const customerInfoDiv = document.getElementById('customerInfo');
    customerInfoDiv.innerHTML = `<strong>Customer:</strong> ${customer.name} (${customer.email})`;
}

// Function to Display Pipeline Stages
function displayPipeline(pipelineStages) {
    const pipelineContainer = document.getElementById('pipeline');
    pipelineContainer.innerHTML = ''; // Clear previous content

    pipelineStages.forEach(stage => {
        const stageDiv = document.createElement('div');
        stageDiv.className = 'pipeline-item';
        stageDiv.innerText = stage;
        pipelineContainer.appendChild(stageDiv);
    });
}
