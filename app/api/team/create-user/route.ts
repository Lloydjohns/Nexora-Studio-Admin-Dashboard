import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

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
    { status },
  );
}

function normalizeEmail(
  value: unknown,
) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
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
       2. VERIFY ADMIN
    ======================================================== */

    /*
     * ADMIN_EMAILS should contain the email(s) that are allowed
     * to create team accounts.
     *
     * Example:
     *
     * ADMIN_EMAILS=admin@example.com
     *
     * Multiple:
     *
     * ADMIN_EMAILS=admin@example.com,owner@example.com
     */

    const adminEmails =
      String(
        process.env.ADMIN_EMAILS ?? '',
      )
        .split(',')
        .map(normalizeEmail)
        .filter(Boolean);

    if (
      adminEmails.length === 0
    ) {
      console.error(
        'ADMIN_EMAILS is not configured.',
      );

      return jsonError(
        'ADMIN_EMAILS is not configured on the server. Add your administrator email to Vercel Environment Variables and redeploy.',
        500,
      );
    }

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
       5. VALIDATE
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
       6. CREATE SERVER ADMIN CLIENT
    ======================================================== */

    /*
     * This uses the Supabase SERVICE ROLE key.
     *
     * It is SERVER ONLY.
     */
    const supabaseAdmin =
      createSupabaseAdmin();

    /* ========================================================
       7. CHECK WHETHER EMAIL ALREADY EXISTS
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
       8. CREATE AUTH ACCOUNT
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
           * User can log in immediately.
           */
          email_confirm: true,

          /*
           * Store useful profile information in
           * Supabase Auth metadata.
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
     * Explicitly type this as a record.
     *
     * This prevents the TypeScript `never[]` problem that
     * previously appeared in your build.
     */
    const teamMemberPayload:
      Record<
        string,
        unknown
      > = {
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
       10. SUCCESS
    ======================================================== */

    createdAuthUserId =
      null;

    return NextResponse.json(
      {
        success: true,

        message:
          'Team account created successfully.',

        userId:
          authData.user.id,

        member,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
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