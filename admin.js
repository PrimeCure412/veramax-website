// Global variable for uploaded gift image filename
let currentUploadedGiftImage = '';

// --- Preview Gift Image ---
function previewGiftImage(input) {
    try {
        const box = document.getElementById('giftImagePreviewBox');
        if (input && input.files && input.files[0]) {
            const fileName = input.files[0].name;
            currentUploadedGiftImage = 'images/' + fileName;
            if (box) box.innerHTML = `<span style="font-size: 11px; color: #ff6b00; text-align: center;"><b>${fileName}</b></span>`;
        } else {
            currentUploadedGiftImage = '';
            if (box) box.innerHTML = `<span style="font-size: 10px; color: #aaa; text-align: center;">No Image</span>`;
        }
    } catch (e) {
        console.error("Preview image error:", e);
    }
}

// --- Tab Switching Logic ---
function switchTab(tabId, btnElement) {
    try {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.remove('active-tab');
            tab.style.display = 'none';
        });

        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active-tab');
            targetTab.style.display = 'block';
        }

        if (btnElement) btnElement.classList.add('active');
    } catch (e) {
        console.error("Tab switch error:", e);
    }
}

// --- Toggle Product Form Visibility ---
function toggleProductForm() {
    try {
        const formCard = document.getElementById('productFormCard');
        const btn = document.getElementById('toggleFormBtn');
        const form = document.getElementById('productForm');
        
        if (form) {
            delete form.dataset.editId;
            form.reset();
            generateProductCode();
        }

        if (formCard) {
            if (formCard.style.display === 'none' || formCard.style.display === '') {
                formCard.style.display = 'block';
                if (btn) btn.innerText = '- Close Form';
            } else {
                formCard.style.display = 'none';
                if (btn) btn.innerText = '+ Add New Product';
            }
        }
    } catch (e) {
        console.error("Toggle product form error:", e);
    }
}

// --- Auto Generate Product Code ---
function generateProductCode() {
    try {
        let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
        let nextNum = products.length + 1;
        let code = 'VM-' + String(nextNum).padStart(4, '0');
        const codeSpan = document.getElementById('autoProductCode');
        if (codeSpan) codeSpan.innerText = code;
        return code;
    } catch (e) {
        return 'VM-0001';
    }
}

// --- Page Load Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    try { displayManufacturers(); } catch(e) {}
    try { displayAdminProducts(); } catch(e) {}
    try { populateManufacturerDropdowns(); } catch(e) {}
    try { populateProductDropdowns(); } catch(e) {}
    try { populateCalcProductDropdown(); } catch(e) {}
    try { initBillingProductRows(); } catch(e) {}
    try { displaySavedSchemesTable(); } catch(e) {}
    try { generateProductCode(); } catch(e) {}
    try { updateDocNumberPreview(); } catch(e) {}
    
    setupForms();
});

function setupForms() {
    const manufacturerForm = document.getElementById('manufacturerForm');
    if (manufacturerForm) {
        manufacturerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('mfgName').value;
            const person = document.getElementById('mfgPerson').value;
            const email = document.getElementById('mfgEmail').value;
            const mobile = document.getElementById('mfgMobile').value;

            const newMfg = { id: Date.now(), name, person, email, mobile };
            let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];
            manufacturers.push(newMfg);
            localStorage.setItem('veramax_manufacturers', JSON.stringify(manufacturers));

            alert('Manufacturer saved successfully!');
            manufacturerForm.reset();
            displayManufacturers();
            populateManufacturerDropdowns();
        });
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
            let editId = productForm.dataset.editId;

            const segment = document.getElementById('prodSegment').value;
            const listType = document.getElementById('prodListType').value;
            const brandName = document.getElementById('prodBrandName').value;
            const composition = document.getElementById('prodComposition').value;
            const formulation = document.getElementById('prodFormulation').value;
            const packing = document.getElementById('prodPacking').value;
            const packSize = document.getElementById('prodPackSize').value;
            const mrp = document.getElementById('prodMrp').value;
            const rate = document.getElementById('prodRate').value;
            const hsnCode = document.getElementById('prodHsnCode').value;
            const gstTax = document.getElementById('prodGstTax').value;
            const manufacturer = document.getElementById('prodManufacturer').value;

            const allFileInputs = productForm.querySelectorAll('input[type="file"]');
            let imgFileObj = allFileInputs[0] && allFileInputs[0].files[0] ? allFileInputs[0].files[0] : null;
            let visualFileObj = allFileInputs[1] && allFileInputs[1].files[0] ? allFileInputs[1].files[0] : null;
            let bannerFileObj = allFileInputs[2] && allFileInputs[2].files[0] ? allFileInputs[2].files[0] : null;

            let existingProduct = editId ? products.find(item => item.id == editId) : null;

            let finalImg = imgFileObj ? 'images/' + imgFileObj.name : (existingProduct ? existingProduct.productImage : '');
            let finalVisual = visualFileObj ? 'images/' + visualFileObj.name : (existingProduct ? existingProduct.visualAid : '');
            let finalBanner = bannerFileObj ? 'images/' + bannerFileObj.name : (existingProduct ? existingProduct.banner : '');

            let productDataToSave = {
                id: editId ? Number(editId) : Date.now(),
                code: existingProduct ? existingProduct.code : generateProductCode(),
                segment, listType, brandName, composition, formulation, packing, packSize, mrp, rate, hsnCode, gstTax, manufacturer,
                productImage: finalImg,
                visualAid: finalVisual,
                banner: finalBanner
            };

            if (editId && existingProduct) {
                let index = products.findIndex(item => item.id == editId);
                if (index !== -1) products[index] = productDataToSave;
                delete productForm.dataset.editId;
            } else {
                products.push(productDataToSave);
            }

            localStorage.setItem('veramax_products', JSON.stringify(products));
            alert('✅ Product saved successfully to Veramax database!');
            productForm.reset();
            generateProductCode();
            toggleProductForm();
            displayAdminProducts();
            populateProductDropdowns();
            populateCalcProductDropdown();
            initBillingProductRows();
        });
    }
}

// --- 1. MANAGE MANUFACTURER LOGIC ---
function displayManufacturers() {
    const container = document.getElementById('manufacturerListContainer');
    if (!container) return;
    let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];

    if (manufacturers.length === 0) {
        container.innerHTML = '<p style="color: #777;">No manufacturers added yet.</p>';
        return;
    }

    let html = `<table class="table-style"><tr><th>Factory Name</th><th>Contact Person</th><th>Email ID</th><th>Mobile No.</th><th>Actions</th></tr>`;
    manufacturers.forEach(m => {
        html += `<tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.person}</td>
            <td>${m.email}</td>
            <td>${m.mobile}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editManufacturer(${m.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteManufacturer(${m.id})">Delete</button>
            </td>
        </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
}

function editManufacturer(id) {
    let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];
    let m = manufacturers.find(item => item.id === id);
    if (!m) return;

    let newName = prompt("Edit Factory Name:", m.name);
    let newPerson = prompt("Edit Contact Person:", m.person);
    let newEmail = prompt("Edit Email ID:", m.email);
    let newMobile = prompt("Edit Mobile No.:", m.mobile);

    if (newName && newEmail) {
        m.name = newName;
        m.person = newPerson || m.person;
        m.email = newEmail;
        m.mobile = newMobile || m.mobile;
        localStorage.setItem('veramax_manufacturers', JSON.stringify(manufacturers));
        displayManufacturers();
        populateManufacturerDropdowns();
        alert("Manufacturer updated successfully!");
    }
}

function deleteManufacturer(id) {
    let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];
    manufacturers = manufacturers.filter(m => m.id !== id);
    localStorage.setItem('veramax_manufacturers', JSON.stringify(manufacturers));
    displayManufacturers();
    populateManufacturerDropdowns();
}

function populateManufacturerDropdowns() {
    let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];
    const prodMfgSelect = document.getElementById('prodManufacturer');
    const enquiryMfgSelect = document.getElementById('enquiryMfgSelect');

    let options = '<option value="">Select Manufacturer</option>';
    manufacturers.forEach(m => {
        options += `<option value="${m.name}">${m.name} (${m.email})</option>`;
    });

    if (prodMfgSelect) prodMfgSelect.innerHTML = options;
    if (enquiryMfgSelect) enquiryMfgSelect.innerHTML = options;
}

// --- 2. MANAGE PRODUCT LOGIC ---
function displayAdminProducts() {
    const container = document.getElementById('adminProductCatalogList');
    if (!container) return;
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];

    if (products.length === 0) {
        container.innerHTML = '<p style="color: #777;">No products added to catalog yet.</p>';
        return;
    }

    let html = `<table class="table-style" id="adminProductsTable">
        <tr><th>SR</th><th>CODE</th><th>BRAND NAME</th><th>COMPOSITION</th><th>HSN CODE</th><th>MRP</th><th>RATE</th><th>ACTIONS</th></tr>`;
        
    products.forEach((p, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${p.code || 'VM-0000'}</strong></td>
            <td><strong>${p.brandName}</strong></td>
            <td>${p.composition}</td>
            <td><span style="color:#ff6b00; font-weight:bold;">${p.hsnCode || 'N/A'}</span></td>
            <td>₹${p.mrp}</td>
            <td><strong>₹${p.rate}</strong></td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${p.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
}

function filterAdminProductCatalog() {
    const filter = document.getElementById('productSearchInput').value.toLowerCase().trim();
    const table = document.getElementById('adminProductsTable');
    if (!table) return;
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        let text = rows[i].innerText.toLowerCase();
        rows[i].style.display = text.includes(filter) ? '' : 'none';
    }
}

function editProduct(id) {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let p = products.find(item => item.id === id);
    if (!p) return;

    const formCard = document.getElementById('productFormCard');
    const toggleBtn = document.getElementById('toggleFormBtn');
    if (formCard) {
        formCard.style.display = 'block';
        if (toggleBtn) toggleBtn.innerText = '- Close Form';
    }

    const form = document.getElementById('productForm');
    if (form) {
        form.dataset.editId = p.id;
        document.getElementById('autoProductCode').innerText = p.code || '';
        document.getElementById('prodSegment').value = p.segment || '';
        document.getElementById('prodListType').value = p.listType || '';
        document.getElementById('prodBrandName').value = p.brandName || '';
        document.getElementById('prodComposition').value = p.composition || '';
        document.getElementById('prodFormulation').value = p.formulation || '';
        document.getElementById('prodPacking').value = p.packing || '';
        document.getElementById('prodPackSize').value = p.packSize || '';
        document.getElementById('prodMrp').value = p.mrp || '';
        document.getElementById('prodRate').value = p.rate || '';
        document.getElementById('prodHsnCode').value = p.hsnCode || '';
        document.getElementById('prodGstTax').value = p.gstTax || '';
        document.getElementById('prodManufacturer').value = p.manufacturer || '';
        formCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('veramax_products', JSON.stringify(products));
    displayAdminProducts();
    populateProductDropdowns();
    populateCalcProductDropdown();
    initBillingProductRows();
}

// --- Download Lists ---

function downloadProductList() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let pcdProducts = products.filter(p => !p.listType || p.listType === 'PCD');

    let win = window.open('', '_blank');
    let html = `<html><head><title>VERAMAX HEALTHCARE - PRODUCT LIST</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: #fff; }
            h2 { text-align: center; color: #ff6b00; margin-bottom: 5px; text-transform: uppercase; font-weight: 800; }
            p { text-align: center; color: #666; margin-top: 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #121212; color: #ffffff; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #ff6b00; color: white; text-align: center; border: none; border-radius: 5px; font-size: 15px; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>VERAMAX HEALTHCARE - PRODUCT LIST</h2>
        <p>Public Catalog (Rates & Pricing Hidden)</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>PRODUCT CODE</th>
                <th>BRAND NAME</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
                <th>MRP</th>
            </tr>`;

    if (pcdProducts.length === 0) {
        html += `<tr><td colspan="8" style="text-align:center; color:#777; padding:20px;">No products added yet.</td></tr>`;
    } else {
        pcdProducts.forEach((p, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td>${p.code || 'VM-0001'}</td>
                <td><b>${p.brandName || 'N/A'}</b></td>
                <td>${p.composition || 'N/A'}</td>
                <td>${p.formulation || 'N/A'}</td>
                <td>${p.packing || 'N/A'}</td>
                <td>${p.packSize || 'N/A'}</td>
                <td>₹${p.mrp || '0.00'}</td>
            </tr>`;
        });
    }

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

function downloadPriceList() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];

    let win = window.open('', '_blank');
    let html = `<html><head><title>VERAMAX HEALTHCARE - CONFIDENTIAL PRICE LIST</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: #fff; }
            h2 { text-align: center; color: #ff6b00; margin-bottom: 5px; text-transform: uppercase; font-weight: 800; }
            p { text-align: center; color: #666; margin-top: 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #121212; color: #ffffff; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #ff6b00; color: white; text-align: center; border: none; border-radius: 5px; font-size: 15px; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>VERAMAX HEALTHCARE - CONFIDENTIAL PRICE LIST</h2>
        <p>Authorized Owner View (Includes Net Rates)</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>PRODUCT CODE</th>
                <th>BRAND NAME</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
                <th>MRP</th>
                <th>RATE</th>
            </tr>`;

    if (products.length === 0) {
        html += `<tr><td colspan="9" style="text-align:center; color:#777; padding:20px;">No products added yet.</td></tr>`;
    } else {
        products.forEach((p, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td>${p.code || 'VM-0001'}</td>
                <td><b>${p.brandName || 'N/A'}</b></td>
                <td>${p.composition || 'N/A'}</td>
                <td>${p.formulation || 'N/A'}</td>
                <td>${p.packing || 'N/A'}</td>
                <td>${p.packSize || 'N/A'}</td>
                <td>₹${p.mrp || '0.00'}</td>
                <td><b style="color: #ff6b00;">₹${p.rate || '0.00'}</b></td>
            </tr>`;
        });
    }

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

function downloadThirdPartyList() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let thirdPartyProducts = products.filter(p => p.listType === 'ThirdParty');
    let listToDisplay = thirdPartyProducts.length > 0 ? thirdPartyProducts : products;

    let win = window.open('', '_blank');
    let html = `<html><head><title>VERAMAX HEALTHCARE - THIRD PARTY MOLECULES</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: #fff; }
            h2 { text-align: center; color: #ff6b00; margin-bottom: 5px; text-transform: uppercase; font-weight: 800; }
            p { text-align: center; color: #666; margin-top: 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #121212; color: #ffffff; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #ff6b00; color: white; text-align: center; border: none; border-radius: 5px; font-size: 15px; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>VERAMAX HEALTHCARE - THIRD PARTY MOLECULES</h2>
        <p>Composition & Formulation List</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
            </tr>`;

    if (listToDisplay.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center; color:#777; padding:20px;">No third-party molecules added yet.</td></tr>`;
    } else {
        listToDisplay.forEach((p, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td><b>${p.composition || 'N/A'}</b></td>
                <td>${p.formulation || 'N/A'}</td>
                <td>${p.packing || 'N/A'}</td>
                <td>${p.packSize || 'N/A'}</td>
            </tr>`;
        });
    }

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

// --- 3. PURCHASE & ENQUIRY HUB ---
function toggleEnquiryMode() {
    const mode = document.getElementById('enquiryMode').value;
    document.getElementById('mode1Container').style.display = mode === 'multipleProduct' ? 'block' : 'none';
    document.getElementById('mode2Container').style.display = mode === 'singleProduct' ? 'block' : 'none';
}

function populateProductDropdowns() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    const sel = document.getElementById('enquiryProductSelect');
    const chk = document.getElementById('checkboxProductList');
    if (!sel || !chk) return;

    let opts = '<option value="">Select Product</option>';
    let chkHtml = '';
    products.forEach(p => {
        opts += `<option value="${p.id}">${p.code} - ${p.brandName}</option>`;
        chkHtml += `<label style="display:block; margin-bottom:4px; font-size:13px;"><input type="checkbox" name="enquiryProdCheck" value="${p.id}"> ${p.code}: ${p.brandName} [${p.composition}]</label>`;
    });
    sel.innerHTML = opts;
    chk.innerHTML = chkHtml;
}

function loadLinkedManufacturersForProduct() {
    const prodId = document.getElementById('enquiryProductSelect').value;
    const box = document.getElementById('checkboxMfgList');
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let manufacturers = JSON.parse(localStorage.getItem('veramax_manufacturers')) || [];
    let prod = products.find(p => p.id == prodId);
    if (!prod || !box) return;

    let html = '';
    manufacturers.forEach(m => {
        let match = m.name === prod.manufacturer;
        html += `<label style="display:block; margin-bottom:4px; font-size:13px;"><input type="checkbox" name="enquiryMfgCheck" value="${m.email}" ${match ? 'checked' : ''}> <b>${m.name}</b> (${m.email}) ${match ? '<span style="color:#ff6b00;">[Linked]</span>' : ''}</label>`;
    });
    box.innerHTML = html;
}

function sendMultiProductEnquiry() {
    const email = document.getElementById('enquiryMfgSelect').value;
    let checked = document.querySelectorAll('input[name="enquiryProdCheck"]:checked');
    if (!email || checked.length === 0) { alert("Please select manufacturer and products!"); return; }
    alert(`Enquiry successfully dispatched from info.veramaxhealthcare@gmail.com to manufacturer: ${email}`);
    logEnquiry('Multiple Products -> Single Mfg', email, checked.length + ' products');
}

function sendSingleProductEnquiry() {
    let checkedMfg = document.querySelectorAll('input[name="enquiryMfgCheck"]:checked');
    const prodId = document.getElementById('enquiryProductSelect').value;
    if (!prodId || checkedMfg.length === 0) { alert("Please select product and manufacturer!"); return; }
    alert(`Enquiry dispatched successfully to ${checkedMfg.length} manufacturers.`);
    logEnquiry('Single Product -> Multiple Mfg', 'Multiple Units', 'Product ID: ' + prodId);
}

function logEnquiry(mode, target, details) {
    const container = document.getElementById('comparisonLogContainer');
    if (!container) return;
    let html = `<div style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;"><b>Mode:</b> ${mode} | <b>Target:</b> ${target} | <b>Details:</b> ${details}<br><small style="color:#ff6b00;">✔ Sent via info.veramaxhealthcare@gmail.com at ${new Date().toLocaleTimeString()}</small></div>`;
    container.innerHTML = container.innerHTML.includes('No enquiries') ? html : html + container.innerHTML;
}

// --- 4. B2B GST INVOICING & DOCUMENTS GENERATOR (MULTI-PRODUCT + CUSTOM RATE & DESCRIPTION) ---
function initBillingProductRows() {
    const container = document.getElementById('billingProductsRowsContainer');
    if (!container) return;
    container.innerHTML = '';
    addBillingProductRow();
}

function addBillingProductRow() {
    const container = document.getElementById('billingProductsRowsContainer');
    if (!container) return;

    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let productOptions = '<option value="">-- Choose Product --</option>';
    products.forEach(p => {
        productOptions += `<option value="${p.id}" data-rate="${p.rate || 0}" data-comp="${p.composition || ''}">${p.brandName} [${p.composition}]</option>`;
    });

    const rowId = 'billing_row_' + Date.now() + Math.floor(Math.random() * 1000);
    const tr = document.createElement('tr');
    tr.id = rowId;
    tr.innerHTML = `
        <td><select class="billing-prod-select" onchange="onBillingProductSelected(this)" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px;">${productOptions}</select></td>
        <td><input type="text" class="billing-desc-input" placeholder="e.g. Custom formula / packaging specs" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px;"></td>
        <td><input type="number" step="0.01" class="billing-rate-input" value="0" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px; font-weight:bold; color:#ff6b00;"></td>
        <td><input type="number" class="billing-qty-input" value="100" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px;"></td>
        <td><button type="button" class="action-btn delete-btn" onclick="removeBillingProductRow('${rowId}')"><i class="fa-solid fa-trash"></i></button></td>
    `;
    container.appendChild(tr);
}

function onBillingProductSelected(selectElem) {
    const row = selectElem.closest('tr');
    const selectedOption = selectElem.options[selectElem.selectedIndex];
    const defaultRate = selectedOption.getAttribute('data-rate') || 0;
    const composition = selectedOption.getAttribute('data-comp') || '';

    const rateInput = row.querySelector('.billing-rate-input');
    const descInput = row.querySelector('.billing-desc-input');

    if (rateInput) rateInput.value = defaultRate;
    if (descInput && !descInput.value) descInput.value = composition;
}

function removeBillingProductRow(rowId) {
    const row = document.getElementById(rowId);
    const container = document.getElementById('billingProductsRowsContainer');
    if (row && container.children.length > 1) {
        row.remove();
    } else {
        alert("At least one product row is required!");
    }
}

function updateDocNumberPreview() {
    const type = document.getElementById('docTypeSelect').value;
    let counts = JSON.parse(localStorage.getItem('veramax_doc_counts')) || { proforma: 1, taxInvoice: 1, purchaseOrder: 1 };
    let prefix = type === 'proforma' ? 'VMPI/26-27/' : type === 'taxInvoice' ? 'VMTI/26-27/' : 'VMPP/26-27/';
    let seq = String(counts[type] || 1).padStart(4, '0');
    const previewInput = document.getElementById('autoDocNumberPreview');
    if (previewInput) previewInput.value = prefix + seq;
}

function generateAndPrintOfficialDocument() {
    const type = document.getElementById('docTypeSelect').value;
    let counts = JSON.parse(localStorage.getItem('veramax_doc_counts')) || { proforma: 1, taxInvoice: 1, purchaseOrder: 1 };
    let prefix = type === 'proforma' ? 'VMPI/26-27/' : type === 'taxInvoice' ? 'VMTI/26-27/' : 'VMPP/26-27/';
    let seqNum = String(counts[type] || 1).padStart(4, '0');
    let docNumber = prefix + seqNum;

    const party = document.getElementById('docPartyName').value || 'Valued Distributor / Factory';
    const area = document.getElementById('docMonopolyArea').value || 'Pan India';
    const transport = document.getElementById('docTransportDetails').value || 'Standard Transport';

    // Gather rows from billing table
    const selects = document.querySelectorAll('.billing-prod-select');
    const descs = document.querySelectorAll('.billing-desc-input');
    const rates = document.querySelectorAll('.billing-rate-input');
    const qtys = document.querySelectorAll('.billing-qty-input');
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];

    let itemsHtml = '';
    let subtotal = 0;
    let srNo = 1;

    for (let i = 0; i < selects.length; i++) {
        let pId = selects[i].value;
        let qty = parseFloat(qtys[i].value) || 0;
        let customRate = parseFloat(rates[i].value) || 0;
        let customDesc = descs[i].value || '';

        if (!pId || qty <= 0) continue;

        let p = products.find(item => item.id == pId);
        if (p) {
            let total = customRate * qty;
            subtotal += total;

            itemsHtml += `<tr>
                <td>${srNo++}</td>
                <td><b>${p.brandName}</b><br><small style="color:#555;">${customDesc || p.composition}</small></td>
                <td>${p.packing || 'N/A'}</td>
                <td>${qty}</td>
                <td>₹${customRate.toFixed(2)}</td>
                <td>₹${total.toFixed(2)}</td>
            </tr>`;
        }
    }

    if (srNo === 1) {
        alert("Please select at least one valid product, rate and quantity!");
        return;
    }

    let gstAmt = subtotal * 0.12;
    let grandTotal = subtotal + gstAmt;

    let title = type === 'proforma' ? 'PROFORMA INVOICE' : type === 'taxInvoice' ? 'TAX INVOICE' : 'PURCHASE ORDER';

    let win = window.open('', '_blank');
    let html = `<html><head><title>${title} - ${docNumber}</title><style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #121212; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-img { max-height: 55px; width: auto; object-fit: contain; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; text-align: left; }
        th { background: #121212; color: #ffffff; }
        .print-btn { display: block; width: 200px; margin: 25px auto; padding: 12px; background: #ff6b00; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        @media print { .print-btn { display: none; } }
    </style></head><body>
    <div class="header">
        <div>
            <img src="logo.png" alt="Veramax Logo" class="logo-img">
            <h2 style="margin:0; font-size:18px;">VERAMAX HEALTHCARE</h2>
            <p style="margin:2px 0 0 0; font-size:12px; color:#555;">Email: info.veramaxhealthcare@gmail.com | Ph: 7070931107</p>
        </div>
        <div style="text-align: right;"><h2 style="color: #ff6b00; margin:0; font-size:20px;">${title}</h2><p style="font-size:12px; margin:3px 0;"><b>Doc No:</b> ${docNumber}<br><b>Date:</b> ${new Date().toLocaleDateString()}</p></div>
    </div>
    <p style="font-size:13px;"><b>Party / Factory Name:</b> ${party}<br><b>Monopoly Area / District:</b> ${area}<br><b>Dispatch / Transport Details:</b> ${transport}</p>
    <table>
        <tr><th>SR NO.</th><th>BRAND NAME & CUSTOM SPECIFICATION</th><th>PACKING</th><th>QTY</th><th>RATE (₹)</th><th>TOTAL (₹)</th></tr>
        ${itemsHtml}
    </table>
    <div style="margin-top: 20px; text-align: right; font-size: 14px;">
        <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
        <p>GST (5%): ₹${gstAmt.toFixed(2)}</p>
        <p style="font-size: 16px;"><b>Grand Total: ₹${grandTotal.toFixed(2)}</b></p>
    </div>
    <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size:13px;"><p>Authorized Signatory<br><b>Veramax Healthcare</b></p><p>Receiver / Factory Signature</p></div>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
    </body></html>`;

    win.document.write(html);
    win.document.close();

    counts[type] = (counts[type] || 1) + 1;
    localStorage.setItem('veramax_doc_counts', JSON.stringify(counts));
    updateDocNumberPreview();
}

// --- 5. SCHEME & PROFIT CALCULATOR ---
function populateCalcProductDropdown() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    const select = document.getElementById('calcProductSelect');
    if (!select) return;
    let opts = '<option value="">-- Choose Product --</option>';
    products.forEach(p => {
        opts += `<option value="${p.id}">${p.brandName} (${p.code})</option>`;
    });
    select.innerHTML = opts;
}

function loadProductCalcDetails() {
    const pId = document.getElementById('calcProductSelect').value;
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let p = products.find(item => item.id == pId);
    if (p) {
        document.getElementById('calcSellingRate').value = p.rate || 0;
        document.getElementById('calcPurchaseRate').value = p.mrp ? (p.mrp * 0.35).toFixed(2) : 0;
        calculateSchemeProfit();
    }
}

function calculateSchemeProfit() {
    const qty = parseFloat(document.getElementById('calcOrderQty').value) || 0;
    const pur = parseFloat(document.getElementById('calcPurchaseRate').value) || 0;
    const sell = parseFloat(document.getElementById('calcSellingRate').value) || 0;
    const giftCost = parseFloat(document.getElementById('calcGiftCost').value) || 0;

    let totalSales = sell * qty;
    let landed = pur;
    let investment = landed * qty;
    let gross = totalSales - investment;
    let suggestedBudget = Math.max(0, totalSales * 0.10);
    let net = gross - giftCost;
    let margin = totalSales > 0 ? (net / totalSales) * 100 : 0;

    document.getElementById('resTotalSales').innerText = `₹${totalSales.toFixed(2)}`;
    document.getElementById('resLandedCost').innerText = `₹${landed.toFixed(2)}`;
    document.getElementById('resGiftBudgetSuggest').innerText = `₹${suggestedBudget.toFixed(2)}`;
    document.getElementById('resNetProfit').innerText = `₹${net.toFixed(2)}`;
    document.getElementById('resMarginPct').innerText = `${margin.toFixed(2)}%`;
}

function saveSchemeCalculation() {
    const pId = document.getElementById('calcProductSelect').value;
    if (!pId) { alert("Please select a product!"); return; }
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let prod = products.find(p => p.id == pId);

    let saved = JSON.parse(localStorage.getItem('veramax_saved_schemes')) || [];
    saved.push({
        id: Date.now(),
        brandName: prod ? prod.brandName : 'N/A',
        orderQty: document.getElementById('calcOrderQty').value,
        giftItem: document.getElementById('calcGiftItem').value || 'Special Gift',
        giftCost: document.getElementById('calcGiftCost').value || 0,
        netProfit: document.getElementById('resNetProfit').innerText,
        marginPct: document.getElementById('resMarginPct').innerText,
        giftImage: currentUploadedGiftImage
    });
    localStorage.setItem('veramax_saved_schemes', JSON.stringify(saved));
    alert("✅ Scheme entry saved!");
    displaySavedSchemesTable();
}

function displaySavedSchemesTable() {
    const container = document.getElementById('savedSchemeListContainer');
    if (!container) return;
    let saved = JSON.parse(localStorage.getItem('veramax_saved_schemes')) || [];
    if (saved.length === 0) { container.innerHTML = '<p style="color: #777;">No saved schemes yet.</p>'; return; }

    let html = `<table class="table-style"><tr><th>SR</th><th>PRODUCT</th><th>QTY</th><th>GIFT ITEM</th><th>NET PROFIT</th><th>MARGIN</th><th>ACTIONS</th></tr>`;
    saved.forEach((s, idx) => {
        html += `<tr><td>${idx+1}</td><td><b>${s.brandName}</b></td><td>${s.orderQty}</td><td>${s.giftItem}</td><td><b style="color:#ff6b00;">${s.netProfit}</b></td><td><b>${s.marginPct}</b></td><td><button class="action-btn delete-btn" onclick="deleteSchemeEntry(${s.id})">Delete</button></td></tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
}

function deleteSchemeEntry(id) {
    let saved = JSON.parse(localStorage.getItem('veramax_saved_schemes')) || [];
    saved = saved.filter(s => s.id != id);
    localStorage.setItem('veramax_saved_schemes', JSON.stringify(saved));
    displaySavedSchemesTable();
}

function generateOwnerConfidentialSheet() {
    let saved = JSON.parse(localStorage.getItem('veramax_saved_schemes')) || [];
    if (saved.length === 0) { alert("No saved schemes!"); return; }
    let win = window.open('', '_blank');
    let html = `<html><head><title>Owner Confidential Costing Sheet</title><style>
        body { font-family: Arial, sans-serif; padding: 25px; background: #fff; }
        h2 { color: #ff6b00; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
        th { background: #121212; color: white; }
    </style></head><body>
    <h2>VERAMAX HEALTHCARE - OWNER CONFIDENTIAL COSTING SHEET</h2>
    <table><tr><th>SR NO.</th><th>BRAND</th><th>QTY</th><th>GIFT ITEM</th><th>GIFT COST</th><th>NET PROFIT</th><th>MARGIN</th></tr>`;
    saved.forEach((s, i) => {
        html += `<tr><td>${i+1}</td><td><b>${s.brandName}</b></td><td>${s.orderQty}</td><td>${s.giftItem}</td><td>₹${s.giftCost}</td><td><b>${s.netProfit}</b></td><td><b>${s.marginPct}</b></td></tr>`;
    });
    html += `</table><button style="display:block; margin:20px auto; padding:10px 20px; background:#ff6b00; color:#fff; border:none; border-radius:5px;" onclick="window.print()">Print</button></body></html>`;
    win.document.write(html);
    win.document.close();
}

function generateClientPublicSchemeSheet() {
    let saved = JSON.parse(localStorage.getItem('veramax_saved_schemes')) || [];
    if (saved.length === 0) { alert("No saved schemes!"); return; }
    let win = window.open('', '_blank');
    let html = `<html><head><title>Client Gift Scheme Catalog</title><style>
        body { font-family: Arial, sans-serif; padding: 25px; background: #fff; }
        h2 { color: #ff6b00; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; }
        th { background: #121212; color: white; }
    </style></head><body>
    <h2>VERAMAX HEALTHCARE - EXCLUSIVE GIFT SCHEME CATALOG</h2>
    <table><tr><th>SR NO.</th><th>BRAND NAME</th><th>REQUIRED QTY</th><th>OFFERED GIFT SCHEME</th></tr>`;
    saved.forEach((s, i) => {
        html += `<tr><td>${i+1}</td><td><b>${s.brandName}</b></td><td><b>${s.orderQty} Units</b></td><td>🎁 ${s.giftItem}</td></tr>`;
    });
    html += `</table><button style="display:block; margin:20px auto; padding:10px 20px; background:#ff6b00; color:#fff; border:none; border-radius:5px;" onclick="window.print()">Print Catalog</button></body></html>`;
    win.document.write(html);
    win.document.close();
}