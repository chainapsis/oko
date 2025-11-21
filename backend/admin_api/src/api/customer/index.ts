import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, randomUUID } from "crypto";
import sharp from "sharp";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
  SMTPConfig,
} from "@oko-wallet/oko-types/admin";
import type {
  Customer,
  CustomerWithAPIKeys,
} from "@oko-wallet/oko-types/customers";
import { uploadToS3 } from "@oko-wallet/aws";
import { hashPassword } from "@oko-wallet/crypto-js";
import {
  insertCustomer,
  getCustomers,
  getCustomersCount,
  deleteCustomer,
  getCustomer,
} from "@oko-wallet/oko-pg-interface/customers";
import {
  insertAPIKey,
  getAPIKeysByCustomerIdsMap,
  updateAPIKeyStatusByCustomerId,
} from "@oko-wallet/oko-pg-interface/api_keys";
import {
  deleteCustomerDashboardUserByCustomerId,
  insertCustomerDashboardUser,
} from "@oko-wallet/oko-pg-interface/customer_dashboard_users";
import type {
  APIKey,
  InsertCustomerDashboardUserRequest,
} from "@oko-wallet/oko-types/ct_dashboard";

import { generatePassword } from "@oko-wallet-admin-api/utils/password";
import { sendCustomerPasswordEmail } from "@oko-wallet-admin-api/email";

export async function createCustomer(
  db: Pool,
  body: CreateCustomerWithDashboardUserRequest,
  opts: {
    s3: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
    };
    email: {
      fromEmail: string;
      smtpConfig: SMTPConfig;
    };
    logo?: { buffer: Buffer; originalname: string } | null;
  },
  _auditContext?: { adminUserId?: string; request?: any; requestId?: string },
): Promise<OkoApiResponse<CreateCustomerResponse>> {
  try {
    if (!body.label || body.label.trim().length === 0) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "Label is required",
      };
    }

    if (body.label.length > 64) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "Label must be 64 characters or less",
      };
    }

    const labelRegex = /^[a-zA-Z0-9\s\-_\.]+$/;
    if (!labelRegex.test(body.label)) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "Label contains invalid characters",
      };
    }

    const customer_id = uuidv4();

    let logo_url: string | null = null;
    if (opts.logo) {
      let metadata;
      try {
        metadata = await sharp(opts.logo.buffer).metadata();
      } catch (err) {
        return {
          success: false,
          code: "IMAGE_UPLOAD_FAILED",
          msg: "Invalid image file",
        };
      }

      if (!metadata.width || !metadata.height) {
        return {
          success: false,
          code: "IMAGE_UPLOAD_FAILED",
          msg: "Could not determine image dimensions",
        };
      }

      if (metadata.width !== 128 || metadata.height !== 128) {
        return {
          success: false,
          code: "IMAGE_UPLOAD_FAILED",
          msg: "Image must be exactly 128x128 pixels",
        };
      }

      let processedBuffer: Buffer;
      try {
        processedBuffer = await sharp(opts.logo.buffer)
          .resize(128, 128, { fit: "cover" })
          .png({ quality: 90 })
          .toBuffer();
      } catch (err) {
        return {
          success: false,
          code: "IMAGE_UPLOAD_FAILED",
          msg: "Failed to process image",
        };
      }

      const safeKey = `logos/${customer_id}-${Date.now()}-${randomUUID()}.png`;

      const uploadRes = await uploadToS3({
        region: opts.s3.region,
        accessKeyId: opts.s3.accessKeyId,
        secretAccessKey: opts.s3.secretAccessKey,
        bucket: opts.s3.bucket,
        key: safeKey,
        body: processedBuffer,
        contentType: "image/png",
      });

      if (!uploadRes.success) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `Failed to upload logo to S3: ${uploadRes.err}`,
        };
      }

      logo_url = uploadRes.data;
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const api_key = randomBytes(32).toString("hex");
      const password = generatePassword();
      const user_id = uuidv4();

      const insertAPIKeyRes = await insertAPIKey(client, customer_id, api_key);
      if (insertAPIKeyRes.success === false) {
        throw new Error(`Failed to insert API key: ${insertAPIKeyRes.err}`);
      }

      const password_hash = await hashPassword(password);
      const customerDashboardUser: InsertCustomerDashboardUserRequest = {
        user_id,
        customer_id,
        email: body.email,
        status: "ACTIVE",
        is_email_verified: false,
        password_hash,
      };
      const insertCustomerDashboardUserRes = await insertCustomerDashboardUser(
        client,
        customerDashboardUser,
      );
      if (insertCustomerDashboardUserRes.success === false) {
        throw new Error(
          `Failed to create customer dashboard user: ${insertCustomerDashboardUserRes.err}`,
        );
      }

      const customer: Customer = {
        customer_id,
        label: body.label,
        url: body.url || null,
        logo_url,
        status: "ACTIVE",
      };
      const insertCustomerRes = await insertCustomer(client, customer);
      if (insertCustomerRes.success === false) {
        throw new Error(`Failed to create customer: ${insertCustomerRes.err}`);
      }

      const sendCustomerPasswordEmailRes = await sendCustomerPasswordEmail(
        body.email,
        password,
        body.label,
        opts.email.fromEmail,
        opts.email.smtpConfig,
      );
      if (sendCustomerPasswordEmailRes.success === false) {
        throw new Error(
          `Failed to send customer password email: ${sendCustomerPasswordEmailRes.error}`,
        );
      }

      await client.query("COMMIT");

      const result = {
        success: true as const,
        data: {
          customer_id,
          label: insertCustomerRes.data.label,
          status: insertCustomerRes.data.status,
          url: insertCustomerRes.data.url,
          logo_url: insertCustomerRes.data.logo_url,
          email: insertCustomerDashboardUserRes.data.email,
          message: "Customer created successfully",
        },
      };

      return result;
    } catch (error) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to create customer: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to create customer: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function getCustomerList(
  db: Pool,
  limit: number,
  offset: number,
): Promise<
  OkoApiResponse<{
    customerWithAPIKeysList: CustomerWithAPIKeys[];
    pagination: {
      total: number;
      current_page: number;
      total_pages: number;
    };
  }>
> {
  try {
    const customersResult = await getCustomers(db, limit, offset);
    if (customersResult.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get customers: ${customersResult.err}`,
      };
    }

    const apiKeysByCustomerIdsMapRes = await getAPIKeysByCustomerIdsMap(
      db,
      customersResult.data.map((c) => c.customer_id),
    );
    if (apiKeysByCustomerIdsMapRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get api keys by customer ids: ${apiKeysByCustomerIdsMapRes.err}`,
      };
    }

    const customersCountResult = await getCustomersCount(db);
    if (customersCountResult.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get customers count: ${customersCountResult.err}`,
      };
    }

    const total = customersCountResult.data;
    const totalPages = Math.ceil(total / limit);
    const currentPage = total ? Math.floor(offset / limit) + 1 : 0;

    return {
      success: true,
      data: {
        customerWithAPIKeysList: customersResult.data.map((customer) => ({
          customer,
          api_keys:
            apiKeysByCustomerIdsMapRes.data.get(customer.customer_id) ||
            ([] as APIKey[]),
        })),
        pagination: {
          total,
          current_page: currentPage,
          total_pages: totalPages,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get customer list: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function getCustomerById(
  db: Pool,
  customer_id: string,
): Promise<OkoApiResponse<Customer>> {
  try {
    const customerRes = await getCustomer(db, customer_id);
    if (customerRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get customer by id: ${customerRes.err}`,
      };
    }

    if (customerRes.data === null) {
      return {
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        msg: "Customer not found",
      };
    }

    return { success: true, data: customerRes.data };
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get customer by id: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function deleteCustomerAndUsers(
  db: Pool,
  customer_id: string,
  auditContext?: { adminUserId?: string; request?: any; requestId?: string },
): Promise<
  OkoApiResponse<{
    customer_id: string;
    customer_dashboard_user_ids: string[];
  }>
> {
  const context = { db, ...auditContext };

  try {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const deleteCustomerRes = await deleteCustomer(client, { customer_id });
      if (deleteCustomerRes.success === false) {
        throw new Error(`Failed to delete customer: ${deleteCustomerRes.err}`);
      }

      const deleteCustomerDashboardUserRes =
        await deleteCustomerDashboardUserByCustomerId(client, { customer_id });
      if (deleteCustomerDashboardUserRes.success === false) {
        throw new Error(
          `Failed to delete customer dashboard user: ${deleteCustomerDashboardUserRes.err}`,
        );
      }

      const updateAPIKeyStatusRes = await updateAPIKeyStatusByCustomerId(
        client,
        customer_id,
        false,
      );
      if (updateAPIKeyStatusRes.success === false) {
        throw new Error(
          `Failed to update api key status: ${updateAPIKeyStatusRes.err}`,
        );
      }

      await client.query("COMMIT");

      const result = {
        success: true as const,
        data: {
          customer_id: deleteCustomerRes.data.customer_id,
          customer_dashboard_user_ids:
            deleteCustomerDashboardUserRes.data.customer_dashboard_user_ids,
        },
      };

      return result;
    } catch (error) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to delete customer and users: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to delete customer and users: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
