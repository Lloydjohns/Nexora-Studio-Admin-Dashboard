import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

/* ============================================================
   TYPES
============================================================ */

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role: string;

  availability?: string;

  activeProjects?: number;
  tasksAssigned?: number;
  tasksCompleted?: number;
  utilization?: number;

  /*
   * Optional:
   *
   * If true, send the new account credentials
   * to the team member using Resend.
   */
  sendWelcomeEmail?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    },
  );
}

/**
 * Normalize email addresses so:
 *
 * JHON@EXAMPLE.COM
 * jhon@example.com
 * jhon@example.com
 *
 * are treated as the same email.
 */
function normalizeEmail(
  value: unknown,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

/**
 * Parse ADMIN_EMAILS safely.
 *
 * Supports:
 *
 * ADMIN_EMAILS=a@gmail.com,b@gmail.com
 *
 * OR:
 *
 * ADMIN_EMAILS=a@gmail.com
 * b@gmail.com
 *
 * OR:
 *
 * ADMIN_EMAILS=a@gmail.com; b@gmail.com
 */
function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ?? '';

  return raw
    .split(/[,\n;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

/**
 * Get the public application URL.
 */
function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://nexora-studio-admin-dashboard.vercel.app'
  ).replace(/\/+$/, '');
}

/**
 * Send welcome email through Resend.
 *
 * This uses the Resend REST API directly,
 * so you do not need to install another package.
 */
async function sendWelcomeEmail({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const resendApiKey =
    process.env.RESEND_API_KEY?.trim();

  const resendFromEmail =
    process.env.RESEND_FROM_EMAIL?.trim();

  if (!resendApiKey) {
    throw new Error(
      'RESEND_API_KEY is not configured on the server.',
    );
  }

  if (!resendFromEmail) {
    throw new Error(
      'RESEND_FROM_EMAIL is not configured on the server.',
    );
  }

  const appUrl =
    getAppUrl();

  const response =
    await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${resendApiKey}`,

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          from: resendFromEmail,

          to: [email],

          subject:
            'Your Nexora Studio Admin Dashboard Account',

          html: `
            <!DOCTYPE html>

            <html>
              <head>
                <meta charset="UTF-8" />

                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                />

                <title>
                  Nexora Studio Account
                </title>
              </head>

              <body
                style="
                  margin:0;
                  padding:0;
                  background:#f5f7fb;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#111827;
                "
              >

                <div
                  style="
                    max-width:600px;
                    margin:40px auto;
                    background:#ffffff;
                    border-radius:12px;
                    overflow:hidden;
                    border:1px solid #e5e7eb;
                  "
                >

                  <div
                    style="
                      padding:28px;
                      background:#111827;
                      color:#ffffff;
                    "
                  >
                    <h1
                      style="
                        margin:0;
                        font-size:24px;
                      "
                    >
                      Nexora Studio
                    </h1>

                    <p
                      style="
                        margin:8px 0 0;
                        color:#d1d5db;
                      "
                    >
                      Admin Dashboard Account
                    </p>
                  </div>

                  <div
                    style="
                      padding:32px;
                    "
                  >

                    <h2
                      style="
                        margin-top:0;
                      "
                    >
                      Hello ${escapeHtml(name)}!
                    </h2>

                    <p>
                      An administrator has created a
                      Nexora Studio Admin Dashboard
                      account for you.
                    </p>

                    <p>
                      You can now use the credentials
                      below to access the dashboard.
                    </p>

                    <div
                      style="
                        margin:24px 0;
                        padding:20px;
                        background:#f9fafb;
                        border:1px solid #e5e7eb;
                        border-radius:8px;
                      "
                    >

                      <p
                        style="
                          margin:0 0 10px;
                        "
                      >
                        <strong>
                          Role:
                        </strong>

                        ${escapeHtml(role)}
                      </p>

                      <p
                        style="
                          margin:0 0 10px;
                        "
                      >
                        <strong>
                          Email:
                        </strong>

                        ${escapeHtml(email)}
                      </p>

                      <p
                        style="
                          margin:0;
                        "
                      >
                        <strong>
                          Temporary Password:
                        </strong>

                        ${escapeHtml(password)}
                      </p>

                    </div>

                    <a
                      href="${appUrl}"
                      style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#111827;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:7px;
                        font-weight:bold;
                      "
                    >
                      Access Admin Dashboard
                    </a>

                    <p
                      style="
                        margin-top:28px;
                        font-size:13px;
                        color:#6b7280;
                        line-height:1.6;
                      "
                    >
                      For security, please change your
                      password after signing in if your
                      dashboard provides a password
                      change option.
                    </p>

                    <p
                      style="
                        font-size:13px;
                        color:#6b7280;
                      "
                    >
                      If you did not expect this account,
                      please contact the Nexora Studio
                      administrator.
                    </p>

                  </div>

                </div>

              </body>
            </html>
          `,
        }),
      },
    );

  if (!response.ok) {
    let errorMessage =
      'Resend failed to send the welcome email.';

    try {
      const errorData =
        await response.json();

      errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorMessage;
    } catch {
      // Keep default error message.
    }

    throw new Error(
      errorMessage,
    );
  }

  return true;
}

/**
 * Escape user-controlled values before
 * placing them inside the email HTML.
 */
function escapeHtml(
  value: string,
): string {
  return value
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    );
}

/* ============================================================
   POST
============================================================ */

export async function POST(
  request: Request,
) {
  let createdAuthUserId:
    | string
    | null = null;

  try {
    /* ========================================================
       1. VERIFY CURRENT LOGIN
    ======================================================== */

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error:
        authCheckError,
    } =
      await supabase.auth.getUser();

    if (
      authCheckError ||
      !user
    ) {
      return jsonError(
        'You must be signed in before creating a team account.',
        401,
      );
    }

    const currentUserEmail =
      normalizeEmail(
        user.email,
      );

    /* ========================================================
       2. LOAD ADMIN EMAILS
    ======================================================== */

    const adminEmails =
      getAdminEmails();

    /*
     * DEBUG INFORMATION
     *
     * We do NOT return the complete ADMIN_EMAILS list
     * to the browser.
     */
    console.log(
      'Team account authorization check:',
      {
        currentUserId:
          user.id,

        currentUserEmail,

        configuredAdminCount:
          adminEmails.length,

        isAuthorized:
          adminEmails.includes(
            currentUserEmail,
          ),
      },
    );

    /* ========================================================
       3. ADMIN_EMAILS CONFIGURATION CHECK
    ======================================================== */

    if (
      adminEmails.length === 0
    ) {
      return jsonError(
        'ADMIN_EMAILS is not configured on the server. Add your administrator email(s) to Vercel Environment Variables and redeploy.',
        500,
      );
    }

    /* ========================================================
       4. VERIFY ADMIN
    ======================================================== */

    if (
      !adminEmails.includes(
        currentUserEmail,
      )
    ) {
      console.warn(
        'Unauthorized team account creation attempt:',
        {
          userId:
            user.id,

          email:
            currentUserEmail,
        },
      );

      return jsonError(
        `Your account is not authorized to create team accounts. The currently signed-in email is "${currentUserEmail}". Add this exact email to ADMIN_EMAILS in Vercel if this account should be an administrator.`,
        403,
      );
    }

    /* ========================================================
       5. READ BODY
    ======================================================== */

    let body:
      | CreateUserBody
      | null = null;

    try {
      body =
        (await request.json()) as CreateUserBody;
    } catch {
      return jsonError(
        'Invalid request body.',
        400,
      );
    }

    if (!body) {
      return jsonError(
        'Request body is missing.',
        400,
      );
    }

    /* ========================================================
       6. NORMALIZE INPUT
    ======================================================== */

    const name =
      String(
        body.name ?? '',
      ).trim();

    const email =
      normalizeEmail(
        body.email,
      );

    const password =
      String(
        body.password ?? '',
      );

    const role =
      String(
        body.role ?? '',
      ).trim();

    const availability =
      String(
        body.availability ??
          'Available',
      ).trim();

    const activeProjects =
      Math.max(
        0,
        Number(
          body.activeProjects ??
            0,
        ) || 0,
      );

    const tasksAssigned =
      Math.max(
        0,
        Number(
          body.tasksAssigned ??
            0,
        ) || 0,
      );

    const tasksCompleted =
      Math.max(
        0,
        Number(
          body.tasksCompleted ??
            0,
        ) || 0,
      );

    const utilization =
      Math.min(
        100,
        Math.max(
          0,
          Number(
            body.utilization ??
              50,
          ) || 0,
        ),
      );

    const sendWelcomeEmail =
      body.sendWelcomeEmail !==
      false;

    /* ========================================================
       7. VALIDATION
    ======================================================== */

    if (!name) {
      return jsonError(
        'Name is required.',
        400,
      );
    }

    if (!email) {
      return jsonError(
        'Email is required.',
        400,
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      return jsonError(
        'Please enter a valid email address.',
        400,
      );
    }

    if (!password) {
      return jsonError(
        'Password is required.',
        400,
      );
    }

    if (
      password.length < 8
    ) {
      return jsonError(
        'Password must contain at least 8 characters.',
        400,
      );
    }

    if (!role) {
      return jsonError(
        'Role is required.',
        400,
      );
    }

    /* ========================================================
       8. CREATE SERVICE ROLE CLIENT
    ======================================================== */

    const supabaseAdmin =
      createSupabaseAdmin();

    /* ========================================================
       9. CHECK TEAM MEMBER EMAIL
    ======================================================== */

    const {
      data:
        existingTeamMembers,
      error:
        teamCheckError,
    } =
      await supabaseAdmin
        .from('team_members')
        .select(
          'id,email',
        )
        .ilike(
          'email',
          email,
        )
        .limit(1);

    if (teamCheckError) {
      console.error(
        'Failed checking team member email:',
        teamCheckError,
      );

      return jsonError(
        'Unable to verify whether this team member already exists.',
        500,
      );
    }

    if (
      existingTeamMembers &&
      existingTeamMembers.length >
        0
    ) {
      return jsonError(
        'A team member with this email already exists.',
        409,
      );
    }

    /* ========================================================
       10. CHECK SUPABASE AUTH USERS
    ======================================================== */

    const {
      data:
        usersData,
      error:
        usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers(
        {
          page: 1,
          perPage: 1000,
        },
      );

    if (usersError) {
      console.error(
        'Could not check existing Auth users:',
        usersError,
      );

      return jsonError(
        'Unable to verify whether this authentication account already exists.',
        500,
      );
    }

    const existingAuthUser =
      usersData.users.find(
        (
          existingUser,
        ) =>
          normalizeEmail(
            existingUser.email,
          ) === email,
      );

    if (
      existingAuthUser
    ) {
      return jsonError(
        'An authentication account with this email already exists.',
        409,
      );
    }

    /* ========================================================
       11. CREATE AUTH ACCOUNT
    ======================================================== */

    const {
      data:
        authData,
      error:
        authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,

          password,

          /*
           * The administrator is creating
           * the account, so the account can
           * immediately log in.
           */
          email_confirm:
            true,

          user_metadata: {
            full_name:
              name,

            role,
          },
        },
      );

    if (authError) {
      console.error(
        'Failed to create Supabase Auth user:',
        {
          message:
            authError.message,

          status:
            authError.status,

          code:
            authError.code,
        },
      );

      return jsonError(
        authError.message ||
          'Failed to create authentication account.',
        400,
      );
    }

    if (
      !authData.user
    ) {
      return jsonError(
        'Supabase did not return the new authentication user.',
        500,
      );
    }

    createdAuthUserId =
      authData.user.id;

    /* ========================================================
       12. CREATE TEAM MEMBER
    ======================================================== */

    const teamMemberPayload =
      {
        name,

        role,

        email,

        active_projects:
          activeProjects,

        tasks_assigned:
          tasksAssigned,

        tasks_completed:
          tasksCompleted,

        availability,

        utilization,
      };

    const {
      data:
        member,
      error:
        memberError,
    } =
      await supabaseAdmin
        .from('team_members')
        .insert(
          teamMemberPayload,
        )
        .select('*')
        .single();

    if (memberError) {
      console.error(
        'Failed to create team_members row:',
        {
          message:
            memberError.message,

          details:
            memberError.details,

          hint:
            memberError.hint,

          code:
            memberError.code,
        },
      );

      /*
       * Rollback Auth account.
       */
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          authData.user.id,
        );

        createdAuthUserId =
          null;
      } catch (
        rollbackError
      ) {
        console.error(
          'Failed to rollback Auth account:',
          rollbackError,
        );
      }

      return jsonError(
        memberError.message ||
          'Failed to create team member record.',
        400,
      );
    }

    /* ========================================================
       13. SEND WELCOME EMAIL
    ======================================================== */

    let emailSent =
      false;

    let emailError:
      | string
      | null = null;

    if (
      sendWelcomeEmail
    ) {
      try {
        await sendWelcomeEmail({
          name,

          email,

          password,

          role,
        });

        emailSent =
          true;
      } catch (
        error: any
      ) {
        console.error(
          'Welcome email failed:',
          error,
        );

        emailError =
          error?.message ||
          'The account was created, but the welcome email could not be sent.';
      }
    }

    /* ========================================================
       14. SUCCESS
    ======================================================== */

    createdAuthUserId =
      null;

    return NextResponse.json(
      {
        success: true,

        message:
          emailSent
            ? 'Team account created and welcome email sent successfully.'
            : 'Team account created successfully.',

        userId:
          authData.user.id,

        member,

        emailSent,

        emailError,
      },
      {
        status: 201,
      },
    );
  } catch (
    error: any
  ) {
    console.error(
      'Create team account error:',
      error,
    );

    /* ========================================================
       FINAL ROLLBACK
    ======================================================== */

    if (
      createdAuthUserId
    ) {
      try {
        const supabaseAdmin =
          createSupabaseAdmin();

        await supabaseAdmin.auth.admin.deleteUser(
          createdAuthUserId,
        );
      } catch (
        rollbackError
      ) {
        console.error(
          'Final Auth rollback failed:',
          rollbackError,
        );
      }
    }

    return jsonError(
      error?.message ||
        'Failed to create team account.',
      500,
    );
  }
}