import { Pool, type PoolClient } from "pg";
import type { Result } from "@oko-wallet/stdlib-js";
import { type Customer } from "@oko-wallet/oko-types/customers";
import { type CustomerAndCTDUser } from "@oko-wallet/oko-types/ct_dashboard";
import type {
  DeleteCustomerRequest,
  DeleteCustomerResponse,
} from "@oko-wallet/oko-types/admin";

export async function insertCustomer(
  db: Pool | PoolClient,
  customer: Customer,
): Promise<Result<Customer, string>> {
  const query = `
INSERT INTO customers (
  customer_id, label, status, 
  url, logo_url
)
VALUES (
  $1, $2, $3, 
  $4, $5
)
RETURNING *
`;

  try {
    const values = [
      customer.customer_id,
      customer.label,
      customer.status,
      customer.url?.length ? customer.url : null,
      customer.logo_url?.length ? customer.logo_url : null,
    ];

    const res = await db.query<Customer>(query, values);

    const row = res.rows[0];
    if (!row) {
      return { success: false, err: `Failed to create customer` };
    }

    return { success: true, data: row };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getCustomer(
  db: Pool,
  customerId: string,
): Promise<Result<Customer | null, string>> {
  const query = `
SELECT * 
FROM customers
WHERE customer_id = $1 AND status = 'ACTIVE'
LIMIT 1
`;

  try {
    const result = await db.query<Customer>(query, [customerId]);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getCustomers(
  db: Pool | PoolClient,
  limit: number,
  offset: number,
): Promise<Result<Customer[], string>> {
  const query = `
SELECT * 
FROM customers 
WHERE status = 'ACTIVE'
ORDER BY created_at DESC, label ASC
LIMIT $1
OFFSET $2
`;

  try {
    const result = await db.query<Customer>(query, [limit, offset]);

    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getCustomersCount(
  db: Pool | PoolClient,
): Promise<Result<number, string>> {
  const query = `
SELECT COUNT(*) 
FROM customers 
WHERE status = 'ACTIVE'
`;

  try {
    const result = await db.query(query);
    return { success: true, data: result.rows[0].count };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getCustomerAndCTDUserByCustomerId(
  db: Pool,
  customerDashboardUserId: string,
): Promise<Result<CustomerAndCTDUser, string>> {
  const query = `
SELECT c.*, u.user_id, u.email, u.status as user_status, u.is_email_verified
FROM customers c
JOIN customer_dashboard_users u ON c.customer_id = u.customer_id
WHERE c.customer_id = $1 AND c.status = 'ACTIVE' 
  AND u.status = 'ACTIVE'
LIMIT 1
`;

  try {
    const result = await db.query(query, [customerDashboardUserId]);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: `Customer not found` };
    }

    const data: CustomerAndCTDUser = {
      customer_id: row.customer_id,
      label: row.label,
      status: row.status,
      url: row.url,
      logo_url: row.logo_url,
      user: {
        customer_id: row.customer_id,
        user_id: row.user_id,
        email: row.email,
        status: row.user_status,
        is_email_verified: row.is_email_verified,
      },
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getCustomerByUserId(
  db: Pool,
  userId: string,
): Promise<Result<Customer | null, string>> {
  const query = `
SELECT * 
FROM customers 
WHERE customer_id = (
    SELECT customer_id 
    FROM customer_dashboard_users 
    WHERE user_id = $1
  ) AND status = 'ACTIVE'
LIMIT 1
`;

  try {
    const result = await db.query<Customer>(query, [userId]);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function updateCustomerInfo(
  db: Pool | PoolClient,
  customerId: string,
  updates: {
    label?: string;
    url?: string | null;
    logo_url?: string | null;
  },
): Promise<Result<Customer, string>> {
  try {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.label !== undefined) {
      updateFields.push(`label = $${paramIndex}`);
      values.push(updates.label);
      paramIndex++;
    }

    if (updates.url !== undefined) {
      updateFields.push(`url = $${paramIndex}`);
      values.push(updates.url);
      paramIndex++;
    }

    if (updates.logo_url !== undefined) {
      updateFields.push(`logo_url = $${paramIndex}`);
      values.push(updates.logo_url);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        err: "No fields to update",
      };
    }

    // Add updated_at
    updateFields.push("updated_at = now()");

    // Add customer_id to values
    values.push(customerId);

    const query = `
UPDATE customers
SET ${updateFields.join(", ")}
WHERE customer_id = $${paramIndex} AND status = 'ACTIVE'
RETURNING *
`;

    const result = await db.query<Customer>(query, values);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: `Customer not found or inactive, customer_id: ${customerId}`,
      };
    }

    return { success: true, data: row };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function deleteCustomer(
  db: Pool | PoolClient,
  request: DeleteCustomerRequest,
): Promise<Result<DeleteCustomerResponse, string>> {
  const query = `
UPDATE customers
SET
  status = 'DELETED',
  updated_at = now()
WHERE customer_id = $1 AND status = 'ACTIVE'
RETURNING customer_id, status
`;

  try {
    const result = await db.query(query, [request.customer_id]);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: `customer account not exists or already deleted, \
customer_id: ${request.customer_id}`,
      };
    }

    const ret: DeleteCustomerResponse = {
      customer_id: row.customer_id,
      status: row.status,
    };

    return { success: true, data: ret };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getInactiveCustomers(
  db: Pool | PoolClient,
  thresholdInterval: string, // e.g., '7 days'
): Promise<Result<(Customer & { email: string; user_id: string })[], string>> {
  const query = `
SELECT c.*, u.email, u.user_id
FROM customer_dashboard_users u
JOIN customers c ON u.customer_id = c.customer_id
WHERE u.status = 'ACTIVE'
  AND c.status = 'ACTIVE'
  AND u.email_verified_at < NOW() - $1::interval
  AND NOT EXISTS (
      SELECT 1 FROM tss_sessions s WHERE s.customer_id = c.customer_id
  )
  AND NOT EXISTS (
      SELECT 1 FROM reminders r WHERE r.target_id = u.user_id AND r.type = 'INACTIVE_APP'
  )
`;

  try {
    const result = await db.query(query, [thresholdInterval]);
    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function recordInactiveAppReminder(
  db: Pool | PoolClient,
  userId: string,
): Promise<Result<void, string>> {
  const query = `
INSERT INTO reminders (target_id, type)
VALUES ($1, 'INACTIVE_APP')
ON CONFLICT (target_id, type) DO NOTHING
`;

  try {
    await db.query(query, [userId]);
    return { success: true, data: void 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
