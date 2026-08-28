import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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

function normalizeEmail(
  value: unknown,
) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function getAdminEmails(): string[] {
  return String(
    process.env.ADMIN_EMAILS ?? '',
  )
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

/* ============================================================
   RESEND
============================================================ */

function getResend() {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Server email configuration is missing: RESEND_API_KEY.',
    );
  }

  return new Resend(apiKey);
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
      error: authCheckError,
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
       2. VERIFY ADMIN EMAIL
    ======================================================== */

    const adminEmails =
      getAdminEmails();

    if (
      adminEmails.length === 0
    ) {
      console.error(
        'ADMIN_EMAILS is not configured.',
      );

      return jsonError(
        'ADMIN_EMAILS is not configured on the server. Add your administrator email(s) to Vercel Environment Variables and redeploy.',
        500,
      );
    }

    console.log(
      'Team account creation authorization:',
      {
        currentUserEmail,
        adminEmails,
      },
    );

    if (
      !adminEmails.includes(
        currentUserEmail,
      )
    ) {
      console.warn(
        'Unauthorized team account creation attempt:',
        {
          userId: user.id,
          email: currentUserEmail,
        },
      );

      return jsonError(
        'Your account is not authorized to create team accounts.',
        403,
      );
    }

    /* ========================================================
       3. READ REQUEST BODY
    ======================================================== */

    let body: CreateUserBody;

    try {
      body =
        (await request.json()) as CreateUserBody;
    } catch {
      return jsonError(
        'Invalid request body.',
        400,
      );
    }

    /* ========================================================
       4. NORMALIZE INPUT
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
        body.role ?? 'Admin',
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

    /* ========================================================
       5. VALIDATION
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
       6. SUPABASE ADMIN CLIENT
    ======================================================== */

    const supabaseAdmin =
      createSupabaseAdmin();

    /* ========================================================
       7. CHECK EXISTING AUTH USER
    ======================================================== */

    const {
      data: usersData,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers(
        {
          page: 1,
          perPage: 1000,
        },
      );

    if (usersError) {
      console.error(
        'Could not check existing users:',
        usersError,
      );

      return jsonError(
        'Unable to verify whether this email already exists.',
        500,
      );
    }

    const existingAuthUser =
      usersData.users.find(
        (existingUser) =>
          normalizeEmail(
            existingUser.email,
          ) === email,
      );

    if (existingAuthUser) {
      return jsonError(
        'An authentication account with this email already exists.',
        409,
      );
    }

    /* ========================================================
       8. CREATE SUPABASE AUTH USER
    ======================================================== */

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,

          /*
           * The account can immediately sign in.
           */
          email_confirm: true,

          /*
           * Store non-sensitive profile information.
           */
          user_metadata: {
            full_name: name,
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
       9. CREATE TEAM MEMBER
    ======================================================== */

    /*
     * IMPORTANT:
     *
     * Do NOT save the password here.
     *
     * Supabase Auth stores the password securely.
     */

    const teamMemberPayload:
      Record<
        string,
        unknown
      > = {
      name,
      role,
      email,

      /*
       * Your database has an avatar column.
       * Generate initials automatically.
       */
      avatar: name
        .split(/\s+/)
        .filter(Boolean)
        .map(
          (part) =>
            part.charAt(0),
        )
        .join('')
        .slice(0, 2)
        .toUpperCase(),

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
      data: member,
      error: memberError,
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

      /* ======================================================
         ROLLBACK AUTH ACCOUNT
      ====================================================== */

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
       10. SEND RESEND EMAIL
    ======================================================== */

    let emailSent =
      false;

    let emailErrorMessage:
      | string
      | null = null;

    try {
      const resend =
        getResend();

      const fromEmail =
        process.env.RESEND_FROM_EMAIL;

      const dashboardUrl =
        process.env.NEXT_PUBLIC_APP_URL;

      if (!fromEmail) {
        throw new Error(
          'RESEND_FROM_EMAIL is not configured.',
        );
      }

      if (!dashboardUrl) {
        throw new Error(
          'NEXT_PUBLIC_APP_URL is not configured.',
        );
      }

      const cleanDashboardUrl =
        dashboardUrl.replace(
          /\/$/,
          '',
        );

      const {
        error: resendError,
      } =
        await resend.emails.send(
          {
            from: fromEmail,

            to: [
              email,
            ],

            subject:
              'Your Nexora Studio Admin Dashboard Account',

            html: `
              <div
                style="
                  font-family: Arial, Helvetica, sans-serif;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 32px;
                  color: #111827;
                  background: #ffffff;
                "
              >
                <h1
                  style="
                    margin-bottom: 8px;
                    font-size: 24px;
                  "
                >
                  Welcome to Nexora Studio
                </h1>

                <p
                  style="
                    color: #4b5563;
                    line-height: 1.6;
                  "
                >
                  Hello ${name},
                </p>

                <p
                  style="
                    color: #4b5563;
                    line-height: 1.6;
                  "
                >
                  Your Nexora Studio Admin Dashboard
                  account has been created successfully.
                  You can now access the dashboard using
                  the credentials below.
                </p>

                <div
                  style="
                    margin: 24px 0;
                    padding: 20px;
                    background: #f3f4f6;
                    border-radius: 10px;
                  "
                >
                  <p style="margin: 8px 0;">
                    <strong>Name:</strong>
                    ${name}
                  </p>

                  <p style="margin: 8px 0;">
                    <strong>Role:</strong>
                    ${role}
                  </p>

                  <p style="margin: 8px 0;">
                    <strong>Email:</strong>
                    ${email}
                  </p>

                  <p style="margin: 8px 0;">
                    <strong>Initial Password:</strong>
                    ${password}
                  </p>
                </div>

                <div
                  style="
                    margin: 28px 0;
                    text-align: center;
                  "
                >
                  <a
                    href="${cleanDashboardUrl}"
                    style="
                      display: inline-block;
                      padding: 12px 22px;
                      background: #111827;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                    "
                  >
                    Access Nexora Dashboard
                  </a>
                </div>

                <p
                  style="
                    color: #6b7280;
                    font-size: 13px;
                    line-height: 1.6;
                  "
                >
                  For security, please change your
                  password after signing in if your
                  dashboard provides a password-change
                  option.
                </p>

                <p
                  style="
                    color: #6b7280;
                    font-size: 13px;
                  "
                >
                  This email was sent automatically by
                  Nexora Studio.
                </p>
              </div>
            `,
          },
        );

      if (resendError) {
        throw new Error(
          resendError.message ||
            'Resend failed to send the email.',
        );
      }

      emailSent =
        true;
    } catch (
      resendError: any
    ) {
      console.error(
        'Failed to send team member email:',
        resendError,
      );

      emailErrorMessage =
        resendError?.message ||
        'The account was created, but the email could not be sent.';
    }

    /* ========================================================
       11. SUCCESS
    ======================================================== */

    createdAuthUserId =
      null;

    return NextResponse.json(
      {
        success: true,

        message:
          emailSent
            ? 'Team account created and email sent successfully.'
            : 'Team account created, but the email could not be sent.',

        userId:
          authData.user.id,

        member,

        /*
         * Returned ONLY after successful creation.
         *
         * It is NOT stored in team_members.
         */
        credentials: {
          name,
          email,
          password,
        },

        emailSent,

        emailError:
          emailErrorMessage,

        dashboardUrl:
          process.env
            .NEXT_PUBLIC_APP_URL ??
          null,
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
       FINAL AUTH ROLLBACK
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
          'Final rollback failed:',
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