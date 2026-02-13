'use client';

/**
 * AG Grid Enterprise initialization.
 * Import this once in a client component high up in the tree (e.g., QueryProvider).
 */
import { LicenseManager, ModuleRegistry, AllEnterpriseModule } from 'ag-grid-enterprise';

// Register enterprise modules
ModuleRegistry.registerModules([AllEnterpriseModule]);

const licenseKey = process.env.NEXT_PUBLIC_AG_GRID_LICENSE;

if (licenseKey) {
    console.log('AG Grid License Key detected, length:', licenseKey.length);
    LicenseManager.setLicenseKey(licenseKey);
} else {
    console.warn('AG Grid License Key NOT found in process.env');
}
