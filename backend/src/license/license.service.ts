import { Injectable } from "@nestjs/common";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { LicenseDataDto } from "src/shared/dtos/license-data.dto";
import { LicenseType } from "src/shared/enums/license-type.enum";

@Injectable()
export class LicenseService {
    
    async generateLicense(dto: LicenseDataDto): Promise<Buffer> {

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600,400]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let y = 340;
        const drawLine = (text: string, options: {bold?: boolean, size?: number} = {}) => {
            page.drawText(text, {
                x: 50,
                y,
                size: options.size ?? 12,
                font: options.bold ? boldFont : font,
                color: rgb(0,0,0),
            });
            y-=25;
        }
        
        drawLine('License for Game Asset Usage', { bold: true, size: 20 });
        y -= 15;

        drawLine(`Thank you for purchase of item: ${dto.assetTitle}`, { bold: true });
        drawLine(`Asset ID: ${dto.assetId}`);
        drawLine(`From author: ${dto.authorUsername} (${dto.authorId})`);
        drawLine(`Purchased on: ${dto.purchasedAt.toDateString()}`);

        y -= 15;

        if (dto.licenseType === LicenseType.CREDIT || dto.licenseType === LicenseType.LICENSE_AND_CREDIT) {
            drawLine('In addition to this license, you must also credit the author in the game.');
        }

        if (dto.licenseType === LicenseType.LICENSE || dto.licenseType === LicenseType.LICENSE_AND_CREDIT) {
            drawLine('This license grants you the right to use this asset under the terms');
            drawLine('agreed upon at the time of purchase.');
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }

}