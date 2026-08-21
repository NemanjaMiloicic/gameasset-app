import { LicenseType } from "../enums/license-type.enum";

export class LicenseDataDto {
    public assetTitle: string;
    public assetId: string;
    public authorUsername: string;
    public authorId: string;
    public purchasedAt: Date;
    public licenseType: LicenseType

}