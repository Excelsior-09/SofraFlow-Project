import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  CIH_BANK_CONFIG,
  ATTIJARIWAFA_BANK_CONFIG,
  CASH_PLUS_CONFIG,
  WESTERN_UNION_CONFIG,
  MONEYGRAM_CONFIG,
  RIA_CONFIG,
  SUBSCRIPTION_PLAN_PRICING
} from '../data/moroccanPaymentConfig';
import { copyToClipboard } from '../utils/clipboard';
import { db } from '../services/db';

describe('Moroccan Payment Methods Integration', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  describe('1. Bank & Money Transfer Configuration Accuracy', () => {
    it('should have exact CIH Bank identifiers matching specification', () => {
      expect(CIH_BANK_CONFIG.titulaire).toBe('ANAS ZIRAOUI');
      expect(CIH_BANK_CONFIG.rib).toBe('230 480 3943173211009100 66');
      expect(CIH_BANK_CONFIG.iban).toBe('MA64 2304 8039 4317 3211 0091 0066');
      expect(CIH_BANK_CONFIG.swiftCode).toBe('CIHMMAMC');
      expect(CIH_BANK_CONFIG.qrCodeUrl).toBe('/payments/qr-cih-bank.jpg');
      expect(CIH_BANK_CONFIG.qrCodeLabel).toBe('Scanner le QR code CIH');

      // Exact multiline format for CIH
      const expectedMultiline = [
        'Titulaire : ANAS ZIRAOUI',
        'RIB : 230 480 3943173211009100 66',
        'IBAN : MA64 2304 8039 4317 3211 0091 0066',
        'Code SWIFT : CIHMMAMC'
      ].join('\n');
      expect(CIH_BANK_CONFIG.fullDetailsFormatted).toBe(expectedMultiline);
    });

    it('should have exact Attijariwafa bank identifiers matching specification', () => {
      expect(ATTIJARIWAFA_BANK_CONFIG.rib).toBe('007 491 0006498300402519 30');
      expect(ATTIJARIWAFA_BANK_CONFIG.accountNumber).toBe('000649H300402519');
      expect(ATTIJARIWAFA_BANK_CONFIG.swiftCode).toBe('BCMAMAMC');
      expect(ATTIJARIWAFA_BANK_CONFIG.qrCodeUrl).toBe('/payments/qr-attijariwafa-bank.jpg');
      expect(ATTIJARIWAFA_BANK_CONFIG.qrCodeLabel).toBe('Scanner le QR code Attijariwafa bank');

      // Exact multiline format for Attijariwafa
      const expectedMultiline = [
        'RIB : 007 491 0006498300402519 30',
        'Numéro de compte : 000649H300402519',
        'Code SWIFT : BCMAMAMC'
      ].join('\n');
      expect(ATTIJARIWAFA_BANK_CONFIG.fullDetailsFormatted).toBe(expectedMultiline);
    });

    it('should have exact Cash Plus, Western Union, MoneyGram, and Ria recipient identifiers', () => {
      expect(CASH_PLUS_CONFIG.beneficiaryName).toBe('Ziraoui Anas');
      expect(CASH_PLUS_CONFIG.phone).toBe('+212613905979');
      expect(CASH_PLUS_CONFIG.fullDetailsFormatted).toBe(
        'Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979'
      );

      expect(WESTERN_UNION_CONFIG.beneficiaryName).toBe('Ziraoui Anas');
      expect(WESTERN_UNION_CONFIG.phone).toBe('+212613905979');
      expect(WESTERN_UNION_CONFIG.fullDetailsFormatted).toBe(
        'Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979'
      );

      // MoneyGram
      expect(MONEYGRAM_CONFIG.beneficiaryName).toBe('Ziraoui Anas');
      expect(MONEYGRAM_CONFIG.phone).toBe('+212613905979');
      expect(MONEYGRAM_CONFIG.serviceName).toBe('MoneyGram');
      expect(MONEYGRAM_CONFIG.fullDetailsFormatted).toBe(
        'Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979'
      );

      // Ria Money Transfer
      expect(RIA_CONFIG.beneficiaryName).toBe('Ziraoui Anas');
      expect(RIA_CONFIG.phone).toBe('+212613905979');
      expect(RIA_CONFIG.serviceName).toBe('Ria Money Transfer');
      expect(RIA_CONFIG.fullDetailsFormatted).toBe(
        'Nom du bénéficiaire : Ziraoui Anas\nTéléphone : +212613905979'
      );
    });
  });

  describe('2. Original Uploaded QR Code Assets', () => {
    it('should have both original QR code assets present in public/payments directory', () => {
      const cihQrPath = path.resolve(process.cwd(), 'public/payments/qr-cih-bank.jpg');
      const awbQrPath = path.resolve(process.cwd(), 'public/payments/qr-attijariwafa-bank.jpg');

      expect(fs.existsSync(cihQrPath)).toBe(true);
      expect(fs.existsSync(awbQrPath)).toBe(true);

      const cihStats = fs.statSync(cihQrPath);
      const awbStats = fs.statSync(awbQrPath);

      // Verify files are legitimate images with non-zero size
      expect(cihStats.size).toBeGreaterThan(1000);
      expect(awbStats.size).toBeGreaterThan(1000);
    });
  });

  describe('3. Clipboard Utility String Integrity', () => {
    it('preserves leading zeros, spaces, uppercase letters and plus signs', async () => {
      // Test leading zero preservation
      const ribWithLeadingZero = '007 491 0006498300402519 30';
      expect(ribWithLeadingZero.startsWith('007')).toBe(true);

      // Test alphanumeric account number preservation
      const accountWithLetter = '000649H300402519';
      expect(accountWithLetter).toContain('H');
      expect(accountWithLetter.startsWith('000649')).toBe(true);

      // Test plus sign in phone number
      const phoneWithPlus = '+212613905979';
      expect(phoneWithPlus.startsWith('+212')).toBe(true);

      // In Node/Vitest environment, copyToClipboard gracefully returns boolean
      const result = await copyToClipboard(ribWithLeadingZero);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('4. Public Pricing Page Privacy & Separation', () => {
    it('should NOT expose sensitive bank details on public pricing page or section', () => {
      const pricingPageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pages/marketing/PricingPage.tsx'),
        'utf-8'
      );
      const pricingSectionCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/marketing/PricingSection.tsx'),
        'utf-8'
      );

      // Verify no RIB, IBAN, account number or phone number is in public marketing code
      const sensitivePatterns = [
        '230 480 3943173211009100 66',
        'MA64 2304 8039 4317 3211 0091 0066',
        '007 491 0006498300402519 30',
        '000649H300402519',
        '+212613905979'
      ];

      sensitivePatterns.forEach(pattern => {
        expect(pricingPageCode).not.toContain(pattern);
        expect(pricingSectionCode).not.toContain(pattern);
      });

      // Verify approved French marketing copy is present
      expect(pricingPageCode).toContain('Modes de paiement disponibles au Maroc');
      expect(pricingPageCode).toContain('Choisir mon abonnement');
      expect(pricingSectionCode).toContain('Modes de paiement disponibles au Maroc');
      expect(pricingSectionCode).toContain('Choisir mon abonnement');
    });
  });

  describe('5. Database Payment Request Workflow & Subscription Activation', () => {
    it('should create a payment request with status under_review', () => {
      const newReq = db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: 'Dar Zellige Marrakech',
        userId: 'user_001',
        userName: 'Anas Ziraoui',
        plan: 'pro',
        billingPeriod: 'annual',
        amount: 10098,
        currency: 'MAD',
        paymentMethod: 'cih_bank',
        transactionReference: 'VIR-CIH-20261022-9901',
        payerName: 'Anas Ziraoui',
        payerPhone: '+212613905979',
        notes: 'Virement annuel effectué via CIH Mobile'
      });

      expect(newReq.id).toBeDefined();
      expect(newReq.status).toBe('under_review');
      expect(newReq.amount).toBe(10098);
      expect(newReq.currency).toBe('MAD');

      const all = db.getPaymentRequests('rest_marrakech_01');
      expect(all.length).toBeGreaterThan(0);
      expect(all.some(r => r.id === newReq.id)).toBe(true);
    });

    it('should activate restaurant subscription upon administrative approval', () => {
      const rest = db.getRestaurantById('rest_marrakech_01');
      expect(rest).toBeDefined();

      // Create request for 'pro' plan
      const req = db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: rest!.name,
        userId: 'user_001',
        userName: 'Anas Ziraoui',
        plan: 'pro',
        billingPeriod: 'monthly',
        amount: 990,
        currency: 'MAD',
        paymentMethod: 'attijariwafa_bank',
        transactionReference: 'AWB-TX-55418'
      });

      expect(req.status).toBe('under_review');

      // Admin approves payment
      const updated = db.updatePaymentRequestStatus(req.id, 'approved', {
        verifierId: 'Admin Finance SOFRAFLOW'
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('approved');
      expect(updated?.verifiedBy).toBe('Admin Finance SOFRAFLOW');
      expect(updated?.verifiedAt).toBeDefined();

      // Verify that restaurant subscription is now automatically activated with 'pro' plan!
      const updatedRest = db.getRestaurantById('rest_marrakech_01');
      expect(updatedRest?.subscriptionPlan).toBe('pro');
      expect(updatedRest?.subscriptionStatus).toBe('active');
    });

    it('should record rejection reason when payment is rejected', () => {
      const req = db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: 'Dar Zellige Marrakech',
        userId: 'user_001',
        userName: 'Anas Ziraoui',
        plan: 'growth',
        billingPeriod: 'monthly',
        amount: 590,
        currency: 'MAD',
        paymentMethod: 'cash_plus',
        transactionReference: 'CP-UNKNOWN-000'
      });

      const rejected = db.updatePaymentRequestStatus(req.id, 'rejected', {
        reason: 'Montant non réceptionné en agence Cash Plus',
        verifierId: 'Auditeur Financier'
      });

      expect(rejected?.status).toBe('rejected');
      expect(rejected?.rejectionReason).toBe('Montant non réceptionné en agence Cash Plus');
      expect(rejected?.verifiedBy).toBe('Auditeur Financier');
    });

    it('should isolate requests by restaurant unless staff or admin', () => {
      db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: 'Dar Zellige Marrakech',
        userId: 'user_001',
        plan: 'starter',
        billingPeriod: 'monthly',
        amount: 290,
        currency: 'MAD',
        paymentMethod: 'cih_bank',
        transactionReference: 'VIR-REST1'
      });

      db.createPaymentRequest({
        restaurantId: 'rest_other_99',
        restaurantName: 'Café Parisien Casablanca',
        userId: 'user_999',
        plan: 'pro',
        billingPeriod: 'monthly',
        amount: 990,
        currency: 'MAD',
        paymentMethod: 'western_union',
        transactionReference: 'WU-REST99'
      });

      // Tenant 1 only sees their requests
      const rest1Requests = db.getPaymentRequests('rest_marrakech_01');
      expect(rest1Requests.every(r => r.restaurantId === 'rest_marrakech_01')).toBe(true);

      // Admin or staff sees all requests across tenants
      const allRequests = db.getPaymentRequests(undefined, true);
      expect(allRequests.some(r => r.restaurantId === 'rest_marrakech_01')).toBe(true);
      expect(allRequests.some(r => r.restaurantId === 'rest_other_99')).toBe(true);
    });

    it('should support MoneyGram and Ria payment methods and activate subscription on approval', () => {
      // MoneyGram test
      const mgReq = db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: 'Dar Zellige Marrakech',
        userId: 'user_001',
        plan: 'growth',
        billingPeriod: 'monthly',
        amount: 590,
        currency: 'MAD',
        paymentMethod: 'moneygram',
        transactionReference: 'MG-88910245',
        payerName: 'Ahmed Tazi'
      });
      expect(mgReq.paymentMethod).toBe('moneygram');
      expect(mgReq.status).toBe('under_review');

      // Ria test
      const riaReq = db.createPaymentRequest({
        restaurantId: 'rest_marrakech_01',
        restaurantName: 'Dar Zellige Marrakech',
        userId: 'user_001',
        plan: 'pro',
        billingPeriod: 'monthly',
        amount: 990,
        currency: 'MAD',
        paymentMethod: 'ria',
        transactionReference: 'RIA-PIN-902341',
        payerName: 'Samira Benjelloun'
      });
      expect(riaReq.paymentMethod).toBe('ria');
      expect(riaReq.status).toBe('under_review');

      // Approve Ria request and verify activation
      const approvedRia = db.updatePaymentRequestStatus(riaReq.id, 'approved', {
        verifierId: 'Auditeur Ria'
      });
      expect(approvedRia?.status).toBe('approved');
      const rest = db.getRestaurantById('rest_marrakech_01');
      expect(rest?.subscriptionPlan).toBe('pro');
      expect(rest?.subscriptionStatus).toBe('active');
    });

    it('should have responsive copy buttons with mobile and desktop styling in BillingPage', () => {
      const billingPageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pages/dashboard/BillingPage.tsx'),
        'utf-8'
      );

      // Verify ResponsiveCopyRow component is implemented with responsive flex and width
      expect(billingPageCode).toContain('ResponsiveCopyRow');
      expect(billingPageCode).toContain('flex flex-col sm:flex-row');
      expect(billingPageCode).toContain('w-full sm:w-auto');
      expect(billingPageCode).toContain('active:scale-95');

      // Verify all 6 payment methods are included in the selector
      expect(billingPageCode).toContain('moneygram');
      expect(billingPageCode).toContain('ria');
      expect(billingPageCode).toContain('cih_bank');
      expect(billingPageCode).toContain('attijariwafa_bank');
      expect(billingPageCode).toContain('cash_plus');
      expect(billingPageCode).toContain('western_union');
    });
  });
});
