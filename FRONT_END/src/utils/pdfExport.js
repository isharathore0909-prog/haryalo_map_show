import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures a DOM element and generates a multi-page PDF with smart page breaks
 * @param {HTMLElement} originalElement - The source element to capture
 * @param {string} fileName - Name of the output PDF
 */
export const exportToPDF = async (originalElement, fileName = 'Report.pdf') => {
    try {
        // 1. Clone the element to capture full height without affecting UI
        const clone = originalElement.cloneNode(true);

        // 2. Style the clone for capture
        Object.assign(clone.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: originalElement.offsetWidth + 'px',
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
            background: '#ffffff',
            zIndex: '-9999',
            visibility: 'visible',
            opacity: '1',
            animation: 'none',
            transition: 'none'
        });

        // Force animations off on all children and ensure visibility
        const allChildren = clone.querySelectorAll('*');
        allChildren.forEach(child => {
            child.style.animation = 'none';
            child.style.transition = 'none';
            child.style.opacity = '1';
            child.style.visibility = 'visible';
        });

        // Force expand the body/scrollers
        const cloneBody = clone.querySelector('.modal-body');
        if (cloneBody) {
            Object.assign(cloneBody.style, {
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
                padding: '40px',
                marginBottom: '0'
            });
        }

        // Hide actions/buttons
        const cloneActions = clone.querySelector('.modal-actions');
        if (cloneActions) cloneActions.style.display = 'none';

        document.body.appendChild(clone);

        // --- SMART PAGE BREAK LOGIC ---
        // A4 Aspect Ratio is 297/210 = 1.414
        const pageHeightPx = clone.offsetWidth * 1.414;
        const sections = clone.querySelectorAll('.report-section');

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const bottom = top + height;

            const pageNumTop = Math.floor(top / pageHeightPx);
            const pageNumBottom = Math.floor(bottom / pageHeightPx);

            // If the section crosses a page boundary
            if (pageNumTop !== pageNumBottom) {
                const crossPoint = (pageNumTop + 1) * pageHeightPx;
                const headerArea = top + 150; // Heading + Icon + spacing

                // Header-Aware: Only push if the break cuts through the header area
                if (headerArea > crossPoint) {
                    const pushAmount = (crossPoint - top);
                    section.style.marginTop = (pushAmount + 10) + 'px';
                }
            }
        });

        // 3. Wait for fonts and charts to settle after layout shifts
        await new Promise(r => setTimeout(r, 1000));

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#eef9f1', // Light mint filler
            height: clone.scrollHeight,
            windowHeight: clone.scrollHeight
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeightInPdf = (imgProps.height * pageWidth) / imgProps.width;

        let heightLeft = imgHeightInPdf;
        let position = 0;

        // Fill background with same green before drawing images
        const fillPageBackground = (p) => {
            p.setFillColor(238, 249, 241); // #eef9f1
            p.rect(0, 0, pageWidth, pageHeight, 'F');
        };

        // Page 1
        fillPageBackground(pdf);
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightInPdf, undefined, 'FAST');
        heightLeft -= pageHeight;

        // Remaining Pages
        while (heightLeft > 0.1) { // 0.1mm buffer to prevent empty last page
            position = heightLeft - imgHeightInPdf;
            pdf.addPage();
            fillPageBackground(pdf);
            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightInPdf, undefined, 'FAST');
            heightLeft -= pageHeight;
        }

        const blobUrl = pdf.output('bloburl');
        window.open(blobUrl, '_blank');
        return true;
    } catch (error) {
        console.error('PDF Export failed:', error);
        throw error;
    }
};
