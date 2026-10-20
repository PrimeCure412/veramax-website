document.addEventListener('DOMContentLoaded', () => {
    loadHomeShowcaseAndBanners();
    startBannerSlider();
});

// --- 1. Synchronized Product & Visual Showcase (4-Second Interval) ---
function loadHomeShowcaseAndBanners() {
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];

    const prodDisplay = document.getElementById('productImageDisplay');
    const visualDisplay = document.getElementById('visualPageDisplay');
    const bannerContainer = document.getElementById('dynamicBannerContainer');

    if (products.length > 0) {
        let showcaseIndex = 0;
        function updateShowcases() {
            let p = products[showcaseIndex % products.length];
            
            let imgSrc = p.productImage || '';
            let brand = p.brandName || 'VeraMax Product';
            let composition = p.composition || '';

            if (prodDisplay) {
                if (imgSrc) {
                    prodDisplay.innerHTML = `
                        <div style="text-align: center; padding: 10px; animation: fadeIn 0.8s ease-in-out;">
                            <img src="${imgSrc}" alt="${brand}" style="max-height: 240px; width: auto; max-width: 100%; object-fit: contain; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            <h4 style="color: #ff6b00; margin: 6px 0; font-size: 17px; font-weight: 700;">${brand}</h4>
                            <p style="color: #64748b; font-size: 12px; margin: 0; max-height: 35px; overflow: hidden;">${composition}</p>
                        </div>
                    `;
                } else {
                    prodDisplay.innerHTML = `<p class="placeholder-txt">No product image uploaded for ${brand}.</p>`;
                }
            }

            let visualSrc = p.visualAid || '';
            if (visualDisplay) {
                if (visualSrc) {
                    visualDisplay.innerHTML = `
                        <div style="text-align: center; padding: 10px; animation: fadeIn 0.8s ease-in-out;">
                            <img src="${visualSrc}" alt="${brand} Visual Aid" style="max-height: 240px; width: auto; max-width: 100%; object-fit: contain; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            <h4 style="color: #121212; margin: 6px 0; font-size: 17px; font-weight: 700;">${brand} Visual Aid</h4>
                            <p style="color: #64748b; font-size: 12px; margin: 0;">Promotional Presentation Page</p>
                        </div>
                    `;
                } else {
                    visualDisplay.innerHTML = `<p class="placeholder-txt">No visual aid uploaded for ${brand}.</p>`;
                }
            }

            showcaseIndex++;
        }

        updateShowcases();
        setInterval(updateShowcases, 4000);
    } else {
        if (prodDisplay) prodDisplay.innerHTML = `<p class="placeholder-txt">No VeraMax products added yet. Add from Admin Dashboard.</p>`;
        if (visualDisplay) visualDisplay.innerHTML = `<p class="placeholder-txt">No visual aid available.</p>`;
    }
}

function startBannerSlider() {
    let currentSlide = 0;
    setInterval(() => {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length > 1) {
            slides[currentSlide].classList.remove('active-slide');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active-slide');
        }
    }, 4000);
}

// --- 2. Public PCD Product List Window (Matching PrimeCure Sample Layout) ---
function openPcdProductList(e) {
    if (e) e.preventDefault();
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let pcdProducts = products.filter(p => !p.listType || p.listType === 'PCD');

    let win = window.open('', '_blank');
    let html = `<html><head><title>VERAMAX HEALTHCARE - PRODUCT LIST</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background: #ffffff; }
            h2 { text-align: center; color: #ff6b00; text-transform: uppercase; margin-bottom: 5px; font-weight: 800; }
            p { text-align: center; color: #64748b; font-size: 13px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #121212; color: #ffffff; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 12px; background: #ff6b00; color: white; text-align: center; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>VERAMAX HEALTHCARE - PRODUCT LIST</h2>
        <p>Public Catalog (Rates & Pricing Hidden)</p>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
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
        html += `<tr><td colspan="8" style="text-align:center; color:#777; padding:20px;">No products found in this category yet. Please add products via Admin Dashboard.</td></tr>`;
    } else {
        pcdProducts.forEach((p, idx) => {
            html += `<tr>
                <td>${idx + 1}</td>
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

// --- 3. Public Third-Party Product List Window (Matching PrimeCure Sample Layout) ---
function openThirdPartyProductList(e) {
    if (e) e.preventDefault();
    let products = JSON.parse(localStorage.getItem('veramax_products')) || [];
    let thirdPartyProducts = products.filter(p => p.listType === 'ThirdParty');
    let listToDisplay = thirdPartyProducts.length > 0 ? thirdPartyProducts : products;

    let win = window.open('', '_blank');
    let html = `<html><head><title>VERAMAX HEALTHCARE - THIRD PARTY MOLECULES</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background: #ffffff; }
            h2 { text-align: center; color: #ff6b00; text-transform: uppercase; margin-bottom: 5px; font-weight: 800; }
            p { text-align: center; color: #64748b; font-size: 13px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #121212; color: #ffffff; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 12px; background: #ff6b00; color: white; text-align: center; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>VERAMAX HEALTHCARE - THIRD PARTY MOLECULES</h2>
        <p>Composition & Formulation List</p>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
            </tr>`;

    if (listToDisplay.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center; color:#777; padding:20px;">No third-party molecules found yet. Please add products via Admin Dashboard.</td></tr>`;
    } else {
        listToDisplay.forEach((p, idx) => {
            html += `<tr>
                <td>${idx + 1}</td>
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

// --- 4. Public Enquiry Form Handler ---
function handlePublicEnquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('enqName').value;
    const phone = document.getElementById('enqPhone').value;
    const email = document.getElementById('enqEmail').value;
    const city = document.getElementById('enqCity').value;
    const message = document.getElementById('enqMessage').value;

    alert(`✅ Thank you ${name}! Your enquiry for ${city} has been successfully submitted and dispatched to info.veramaxhealthcare@gmail.com.`);
    
    let enquiries = JSON.parse(localStorage.getItem('veramax_enquiries')) || [];
    enquiries.unshift({ id: Date.now(), name, phone, email, city, message, time: new Date().toLocaleString() });
    localStorage.setItem('veramax_enquiries', JSON.stringify(enquiries));

    document.getElementById('publicEnquiryForm').reset();
}