import {
  createPayment,
  updatePaymentStatus,
  verifyPayment,
  getPaymentById,
  getPaymentsByUser,
  initiateStkPush,
  handleMpesaCallback,
  formatCurrency,
  validatePaymentData,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../../src/services/paymentService.js";

describe("Payment Service", () => {
  let testUser;
  let testProperty;

  beforeEach(async () => {
    // Create test user
    testUser = await global.prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "+254712345678",
        password: "hashedpassword",
      },
    });

    // Create test property
    testProperty = await global.prisma.property.create({
      data: {
        title: "Test Property",
        description: "A test property",
        propertyType: "APARTMENT",
        listingType: "RENT",
        address: "123 Test Street",
        city: "Nairobi",
        county: "Nairobi",
        latitude: -1.2864,
        longitude: 36.8172,
        price: 50000,
        currency: "KES",
        areaSize: 100,
        ownerId: testUser.id,
      },
    });
  });

  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const paymentData = {
        userId: testUser.id,
        propertyId: testProperty.id,
        amount: 50000,
        currency: "KES",
        provider: PAYMENT_PROVIDERS.MPESA,
        description: "Test payment",
      };

      const payment = await createPayment(paymentData);

      expect(payment).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(payment.userId).toBe(testUser.id);
      expect(payment.propertyId).toBe(testProperty.id);
      expect(payment.amount).toBe(50000);
      expect(payment.currency).toBe("KES");
      expect(payment.provider).toBe(PAYMENT_PROVIDERS.MPESA);
      expect(payment.status).toBe(PAYMENT_STATUSES.PENDING);
      expect(payment.transactionRef).toBeDefined();
    });

    it("should create payment without propertyId", async () => {
      const paymentData = {
        userId: testUser.id,
        amount: 25000,
        currency: "KES",
        provider: PAYMENT_PROVIDERS.FLUTTERWAVE,
      };

      const payment = await createPayment(paymentData);

      expect(payment).toBeDefined();
      expect(payment.propertyId).toBeNull();
      expect(payment.amount).toBe(25000);
    });

    it("should generate transaction reference if not provided", async () => {
      const paymentData = {
        userId: testUser.id,
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      const payment = await createPayment(paymentData);

      expect(payment.transactionRef).toMatch(/^MPESA_\d+_[A-Z0-9]+$/);
    });

    it("should use provided transaction reference", async () => {
      const customRef = "CUSTOM_REF_123";
      const paymentData = {
        userId: testUser.id,
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
        transactionRef: customRef,
      };

      const payment = await createPayment(paymentData);

      expect(payment.transactionRef).toBe(customRef);
    });

    it("should throw error for invalid userId", async () => {
      const paymentData = {
        userId: "invalid-user-id",
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      await expect(createPayment(paymentData)).rejects.toThrow(
        "Failed to create payment"
      );
    });
  });

  describe("validatePaymentData", () => {
    it("should validate correct payment data", () => {
      const data = {
        userId: testUser.id,
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      expect(() => validatePaymentData(data)).not.toThrow();
    });

    it("should throw error for missing userId", () => {
      const data = {
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      expect(() => validatePaymentData(data)).toThrow("User ID is required");
    });

    it("should throw error for invalid amount", () => {
      const data = {
        userId: testUser.id,
        amount: -100,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      expect(() => validatePaymentData(data)).toThrow(
        "Valid amount is required"
      );
    });

    it("should throw error for zero amount", () => {
      const data = {
        userId: testUser.id,
        amount: 0,
        provider: PAYMENT_PROVIDERS.MPESA,
      };

      expect(() => validatePaymentData(data)).toThrow(
        "Valid amount is required"
      );
    });

    it("should throw error for invalid provider", () => {
      const data = {
        userId: testUser.id,
        amount: 10000,
        provider: "INVALID_PROVIDER",
      };

      expect(() => validatePaymentData(data)).toThrow(
        "Valid payment provider is required"
      );
    });

    it("should throw error for invalid currency", () => {
      const data = {
        userId: testUser.id,
        amount: 10000,
        provider: PAYMENT_PROVIDERS.MPESA,
        currency: "INVALID",
      };

      expect(() => validatePaymentData(data)).toThrow(
        "Currency must be KES or USD"
      );
    });
  });

  describe("updatePaymentStatus", () => {
    let testPayment;

    beforeEach(async () => {
      testPayment = await global.prisma.payment.create({
        data: {
          userId: testUser.id,
          amount: 20000,
          currency: "KES",
          provider: PAYMENT_PROVIDERS.MPESA,
          transactionRef: "TEST_REF_123",
          status: PAYMENT_STATUSES.PENDING,
        },
      });
    });

    it("should update payment status successfully", async () => {
      const updatedPayment = await updatePaymentStatus(
        testPayment.id,
        PAYMENT_STATUSES.COMPLETED
      );

      expect(updatedPayment.status).toBe(PAYMENT_STATUSES.COMPLETED);

      // Verify log was created
      const logs = await global.prisma.paymentLog.findMany({
        where: { paymentId: testPayment.id },
      });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe("STATUS_UPDATED");
    });

    it("should throw error for non-existent payment", async () => {
      await expect(
        updatePaymentStatus("non-existent-id", PAYMENT_STATUSES.COMPLETED)
      ).rejects.toThrow("Failed to update payment status");
    });
  });

  describe("getPaymentById", () => {
    let testPayment;

    beforeEach(async () => {
      testPayment = await global.prisma.payment.create({
        data: {
          userId: testUser.id,
          propertyId: testProperty.id,
          amount: 30000,
          currency: "KES",
          provider: PAYMENT_PROVIDERS.FLUTTERWAVE,
          transactionRef: "FW_TEST_123",
          status: PAYMENT_STATUSES.PENDING,
        },
      });
    });

    it("should get payment by ID", async () => {
      const payment = await getPaymentById(testPayment.id);

      expect(payment.id).toBe(testPayment.id);
      expect(payment.user.id).toBe(testUser.id);
      expect(payment.property.id).toBe(testProperty.id);
      expect(payment.logs).toBeDefined();
    });

    it("should get payment by ID with user authorization", async () => {
      const payment = await getPaymentById(testPayment.id, testUser.id);

      expect(payment.id).toBe(testPayment.id);
    });

    it("should throw error for non-existent payment", async () => {
      await expect(getPaymentById("non-existent-id")).rejects.toThrow(
        "Payment not found"
      );
    });

    it("should throw error when user not authorized", async () => {
      const otherUser = await global.prisma.user.create({
        data: {
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          password: "hashedpassword",
        },
      });

      await expect(
        getPaymentById(testPayment.id, otherUser.id)
      ).rejects.toThrow("Payment not found");
    });
  });

  describe("getPaymentsByUser", () => {
    beforeEach(async () => {
      // Create multiple payments for the user
      await global.prisma.payment.createMany({
        data: [
          {
            userId: testUser.id,
            amount: 10000,
            currency: "KES",
            provider: PAYMENT_PROVIDERS.MPESA,
            transactionRef: "MPESA_1",
            status: PAYMENT_STATUSES.COMPLETED,
          },
          {
            userId: testUser.id,
            amount: 20000,
            currency: "KES",
            provider: PAYMENT_PROVIDERS.FLUTTERWAVE,
            transactionRef: "FW_1",
            status: PAYMENT_STATUSES.PENDING,
          },
          {
            userId: testUser.id,
            amount: 15000,
            currency: "KES",
            provider: PAYMENT_PROVIDERS.MPESA,
            transactionRef: "MPESA_2",
            status: PAYMENT_STATUSES.FAILED,
          },
        ],
      });
    });

    it("should get all payments for user", async () => {
      const result = await getPaymentsByUser(testUser.id);

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it("should filter payments by status", async () => {
      const result = await getPaymentsByUser(testUser.id, {
        status: PAYMENT_STATUSES.COMPLETED,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(PAYMENT_STATUSES.COMPLETED);
    });

    it("should filter payments by provider", async () => {
      const result = await getPaymentsByUser(testUser.id, {
        provider: PAYMENT_PROVIDERS.FLUTTERWAVE,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].provider).toBe(PAYMENT_PROVIDERS.FLUTTERWAVE);
    });

    it("should paginate results", async () => {
      const result = await getPaymentsByUser(testUser.id, {
        page: 1,
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });
  });

  describe("formatCurrency", () => {
    it("should format KES currency", () => {
      const result = formatCurrency(50000, "KES");
      expect(result).toBe("KES 50,000.00");
    });

    it("should format USD currency", () => {
      const result = formatCurrency(100, "USD");
      expect(result).toBe("$100.00");
    });

    it("should handle invalid currency gracefully", () => {
      const result = formatCurrency(1000, "INVALID");
      expect(result).toBe("INVALID 1,000.00");
    });
  });
});
