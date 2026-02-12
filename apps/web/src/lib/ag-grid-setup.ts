/**
 * AG Grid Enterprise initialization.
 * Import this once in the root layout.
 *
 * For the license key, set NEXT_PUBLIC_AG_GRID_LICENSE in .env.local
 * During development without a license, the grid works with a watermark.
 */
import { LicenseManager } from 'ag-grid-enterprise';

const licenseKey = process.env.NEXT_PUBLIC_AG_GRID_LICENSE;

if (licenseKey) {
    LicenseManager.setLicenseKey(licenseKey);
}
