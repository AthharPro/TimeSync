import PDFDocument from 'pdfkit';

export abstract class ProfessionalBasePDFGenerator {
    protected doc: PDFDocument;
    protected currentY = 0;
    protected readonly pageWidth = 612; 
    protected readonly pageHeight = 792;
    protected readonly margin = 40;
    protected isFirstPage = true;

    //color scheme
    protected readonly colors = {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
        background: '#F8FAFC',
        border: '#E2E8F0',
        text: {
            primary: '#1E293B',
            secondary: '#64748B',
            muted: '#94A3B8'
        }
    };

    constructor() {
        this.doc = new PDFDocument({
            size: 'LETTER',
            margins: { 
                top: this.margin, 
                bottom: this.margin, 
                left: this.margin, 
                right: this.margin
            }
        });

        //current Y position
        this.currentY = this.margin + 20;
    }



    //PDF buffer
    async generateBuffer(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffers: Uint8Array[] = [];

            this.doc.on('data', (chunk: Uint8Array) => {
                buffers.push(chunk);
            });

            this.doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            this.doc.on('error', (error) => {
                reject(error);
            });
            
            this.doc.end();
        });
    }

    //page break 
    protected checkPageBreak(requiredSpace: number): void {
        if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.currentY = this.margin + 20;
            this.isFirstPage = false;
        }
    }



    //date formatting
    protected formatDate(date: Date | string): string {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format date with time
    protected formatDateTime(date: Date | string): string {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }


}