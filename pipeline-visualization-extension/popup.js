// popup.js

document.addEventListener('DOMContentLoaded', function () {
    // Button Selectors
    const connectButton = document.querySelector('.connect-to-crm');
    const chooseLeadButton = document.querySelector('.choose-lead');

    // Modal Selectors
    const leadModal = document.getElementById('leadModal');
    const closeLeadModalBtn = leadModal.querySelector('.close');
    const customerList = document.getElementById('customerList');

    const crmModal = document.getElementById('crmModal');
    const closeCrmModalBtn = crmModal.querySelector('.close-crm');
    const crmOptionButtons = crmModal.querySelectorAll('.crm-option');

    // Pipeline Container
    const pipelineContainer = document.getElementById('pipelineContainer');
    const pipelineStages = document.getElementById('pipelineStages');
    const backButton = document.getElementById('backButton');

    // Buttons Container (to hide/show)
    const buttonsContainer = document.querySelector('.buttons-container');

    // CRM Status Indicator
    const crmStatusDiv = document.getElementById('crmStatus');

    // Event Listener for "Connect to CRM" Button
    if (connectButton) {
        connectButton.addEventListener('click', function () {
            openCrmModal();
        });
    } else {
        console.error('Connect Button not found');
    }

    // Event Listener for "Choose Lead" Button
    if (chooseLeadButton) {
        chooseLeadButton.addEventListener('click', function () {
            openLeadModal();
        });
    } else {
        console.error('Choose Lead Button not found');
    }

    // Event Listener for Closing Lead Modal
    if (closeLeadModalBtn) {
        closeLeadModalBtn.addEventListener('click', function () {
            closeLeadModal();
        });
    } else {
        console.error('Close Lead Modal Button not found');
    }

    // Event Listener for Closing CRM Modal
    if (closeCrmModalBtn) {
        closeCrmModalBtn.addEventListener('click', function () {
            closeCrmModal();
        });
    } else {
        console.error('Close CRM Modal Button not found');
    }

    // Event Listeners for CRM Option Buttons
    if (crmOptionButtons) {
        crmOptionButtons.forEach(button => {
            button.addEventListener('click', function () {
                const dataFile = this.getAttribute('data-file');
                selectCrm(dataFile);
            });
        });
    } else {
        console.error('CRM Option Buttons not found');
    }

    // Event Listener for Back Button in Pipeline View
    if (backButton) {
        backButton.addEventListener('click', function () {
            closePipelineView();
        });
    } else {
        console.error('Back Button not found');
    }

    // Function to Open CRM Modal
    function openCrmModal() {
        if (crmModal) {
            crmModal.style.display = 'block';
        } else {
            console.error('CRM Modal not found');
        }
    }

    // Function to Close CRM Modal
    function closeCrmModal() {
        if (crmModal) {
            crmModal.style.display = 'none';
        } else {
            console.error('CRM Modal not found');
        }
    }

    // Function to Select CRM and Store Selection
    function selectCrm(dataFile) {
        if (dataFile) {
            // Store selected CRM data file using Chrome Storage API
            chrome.storage.local.set({ selectedDataFile: dataFile }, function() {
                console.log('Selected CRM data file saved:', dataFile);
                closeCrmModal();
                updateCrmStatus(); // Update CRM status indicator
            });
        } else {
            console.error('No CRM data file selected');
        }
    }

    // Function to Update CRM Status Indicator
    function updateCrmStatus() {
        chrome.storage.local.get(['selectedDataFile'], function(result) {
            const dataFile = result.selectedDataFile;

            if (crmStatusDiv) {
                if (dataFile === 'data.json') {
                    crmStatusDiv.innerText = 'Connected to CRM 1';
                } else if (dataFile === 'data2.json') {
                    crmStatusDiv.innerText = 'Connected to CRM 2';
                } else {
                    crmStatusDiv.innerText = 'No CRM Connected';
                }
            }
        });
    }

    // Function to Open Pipeline View
    function openPipelineView() {
        // Hide buttons container
        if (buttonsContainer) {
            buttonsContainer.style.display = 'none';
        }

        // Show pipeline container
        if (pipelineContainer) {
            pipelineContainer.style.display = 'block';
            displayPipeline();
        } else {
            console.error('Pipeline Container not found');
        }
    }

    // Function to Close Pipeline View
    function closePipelineView() {
        // Hide pipeline container
        if (pipelineContainer) {
            pipelineContainer.style.display = 'none';
        }

        // Show buttons container
        if (buttonsContainer) {
            buttonsContainer.style.display = 'flex';
        }
    }

    // Function to Open Lead Modal
    function openLeadModal() {
        if (leadModal) {
            leadModal.style.display = 'block';
            loadCustomers();
        } else {
            console.error('Lead Modal not found');
        }
    }

    // Function to Close Lead Modal
    function closeLeadModal() {
        if (leadModal) {
            leadModal.style.display = 'none';
        } else {
            console.error('Lead Modal not found');
        }
    }

    // Function to Load Customers from the Selected CRM Data File
    function loadCustomers() {
        // Retrieve the selected CRM data file from storage
        chrome.storage.local.get(['selectedDataFile'], function(result) {
            const dataFile = result.selectedDataFile;

            if (!dataFile) {
                alert('No CRM selected. Please connect to a CRM first.');
                closeLeadModal();
                return;
            }

            // Fetch the appropriate data file
            fetch(chrome.runtime.getURL(dataFile))
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    displayCustomers(data);
                })
                .catch(error => {
                    console.error('Error loading customers:', error);
                    customerList.innerHTML = '<p>Failed to load customers.</p>';
                });
        });
    }

    // Function to Display Customers in Lead Modal
    function displayCustomers(customers) {
        if (customerList) {
            customerList.innerHTML = ''; // Clear previous content

            customers.forEach(customer => {
                const customerDiv = document.createElement('div');
                customerDiv.className = 'customer-item';
                customerDiv.innerText = `${customer.name} (${customer.email})`;
                customerDiv.dataset.id = customer.id;
                customerDiv.addEventListener('click', function() {
                    selectCustomer(customer);
                });
                customerList.appendChild(customerDiv);
            });
        } else {
            console.error('Customer List container not found');
        }
    }

    // Function to Handle Customer Selection
    function selectCustomer(customer) {
        if (customer) {
            // Store selected customer using Chrome Storage API
            chrome.storage.local.set({ selectedCustomer: customer }, function() {
                console.log('Selected customer saved:', customer);
                closeLeadModal();
                openPipelineView();
            });
        } else {
            console.error('No customer data to select');
        }
    }

    // Function to Display Pipeline
    function displayPipeline() {
        // Retrieve the selected customer and CRM data file from storage
        chrome.storage.local.get(['selectedCustomer', 'selectedDataFile'], function(result) {
            const customer = result.selectedCustomer;
            const dataFile = result.selectedDataFile;

            if (!dataFile) {
                alert('No CRM selected. Please connect to a CRM first.');
                closePipelineView();
                return;
            }

            if (customer) {
                // Clear previous pipeline stages
                pipelineStages.innerHTML = '';

                // Display customer info
                const customerInfo = document.createElement('div');
                customerInfo.className = 'customer-info';
                customerInfo.innerHTML = `<strong>Customer:</strong> ${customer.name} (${customer.email})`;
                pipelineStages.appendChild(customerInfo);

                // Iterate over pipeline stages and display with status
                customer.pipeline.forEach(stageObj => {
                    const stageDiv = document.createElement('div');
                    stageDiv.className = 'pipeline-stage';

                    // Create stage name element
                    const stageName = document.createElement('span');
                    stageName.className = 'stage-name';
                    stageName.innerText = stageObj.stage;

                    // Create stage status element
                    const stageStatus = document.createElement('span');
                    stageStatus.className = 'stage-status';
                    // Capitalize the first letter of the status
                    stageStatus.innerText = capitalizeFirstLetter(stageObj.status);

                    // Append stage name and status to stageDiv
                    stageDiv.appendChild(stageName);
                    stageDiv.appendChild(stageStatus);

                    // Apply class based on status for styling
                    if (stageObj.status === 'completed') {
                        stageDiv.classList.add('completed');
                    } else if (stageObj.status === 'active') {
                        stageDiv.classList.add('active');
                    } else {
                        stageDiv.classList.add('pending');
                    }

                    pipelineStages.appendChild(stageDiv);
                });
            } else {
                alert('No customer selected. Please choose a lead first.');
            }
        });
    }

    // Utility Function to Capitalize First Letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Optional: Handle Popup Close with Escape Key
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeCrmModal();
            closeLeadModal();
        }
    });

    // Initialize CRM Status on Popup Load
    updateCrmStatus();
});
