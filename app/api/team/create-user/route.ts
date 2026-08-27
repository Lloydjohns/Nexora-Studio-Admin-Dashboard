import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

function errorResponse(
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

/* ============================================================
   CREATE TEAM ACCOUNT
============================================================ */

export async function POST(
  request: Request,
) {
  let createdAuthUserId:
    | string
    | null = null;

  try {
    /* ========================================================
       1. VERIFY CURRENTLY LOGGED-IN USER
    ======================================================== */

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (userError) {
      console.error(
        'Failed to get current user:',
        userError,
      );

      return errorResponse(
        'Unable to verify your current session.',
        401,
      );
    }

    if (!user) {
      return errorResponse(
        'You must be signed in as an administrator to create team accounts.',
        401,
      );
    }

    /* ========================================================
       2. VERIFY ADMINISTRATOR
    ======================================================== */

    const adminEmails =
      String(
        process.env.ADMIN_EMAILS ?? '',
      )
        .split(',')
        .map((email) =>
          email
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean);

    const currentUserEmail =
      String(
        user.email ?? '',
      )
        .trim()
        .toLowerCase();

    /*
     * ADMIN_EMAILS must be configured.
     *
     * Example:
     *
     * ADMIN_EMAILS=admin@nexorastudio.ph,owner@nexorastudio.ph
     */
    if (
      adminEmails.length ===
      0
    ) {
      console.error(
        'ADMIN_EMAILS is missing or empty.',
      );

      return errorResponse(
        'Server administrator configuration is missing.',
        500,
      );
    }

    if (
      !currentUserEmail ||
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

      return errorResponse(
        'Only authorized administrators can create team accounts.',
        403,
      );
    }

    /* ========================================================
       3. READ REQUEST BODY
    ======================================================== */

    let body:
      | CreateUserBody;

    try {
      body =
        (await request.json()) as CreateUserBody;
    } catch {
      return errorResponse(
        'Invalid request body.',
        400,
      );
    }

    /* ========================================================
       4. CLEAN INPUT
    ======================================================== */

    const name =
      String(
        body.name ?? '',
      ).trim();

    const email =
      String(
        body.email ?? '',
      )
        .trim()
        .toLowerCase();

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
      return errorResponse(
        'Name is required.',
        400,
      );
    }

    if (!email) {
      return errorResponse(
        'Email is required.',
        400,
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email,
      )
    ) {
      return errorResponse(
        'Please provide a valid email address.',
        400,
      );
    }

    if (!password) {
      return errorResponse(
        'Password is required.',
        400,
      );
    }

    if (
      password.length < 8
    ) {
      return errorResponse(
        'Password must contain at least 8 characters.',
        400,
      );
    }

    if (!role) {
      return errorResponse(
        'Role is required.',
        400,
      );
    }

    /* ========================================================
       6. CHECK WHETHER AUTH USER ALREADY EXISTS
    ======================================================== */

    try {
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

      if (!usersError) {
        const existingUser =
          usersData.users.find(
            (existingUser) =>
              String(
                existingUser.email ??
                  '',
              )
                .trim()
                .toLowerCase() ===
              email,
          );

        if (existingUser) {
          return errorResponse(
            'An account with this email already exists.',
            409,
          );
        }
      }
    } catch (error) {
      /*
       * Duplicate detection is only a convenience check.
       *
       * Supabase Auth will still reject duplicate emails if the
       * account exists.
       */
      console.warn(
        'Could not complete duplicate email check:',
        error,
      );
    }

    /* ========================================================
       7. CREATE SUPABASE AUTH USER
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
           * Admin-created team accounts can log in immediately.
           */
          email_confirm: true,

          user_metadata: {
            full_name: name,
            role,
          },
        },
      );

    if (authError) {
      console.error(
        'Supabase Auth createUser failed:',
        {
          message:
            authError.message,
          status:
            authError.status,
          code:
            authError.code,
        },
      );

      return errorResponse(
        authError.message ||
          'Failed to create the authentication account.',
        400,
      );
    }

    if (
      !authData.user
    ) {
      return errorResponse(
        'Supabase did not return the created user.',
        500,
      );
    }

    createdAuthUserId =
      authData.user.id;

    /* ========================================================
       8. CREATE TEAM MEMBERS RECORD
    ======================================================== */

    /*
     * Keep this payload as a separate object.
     *
     * The cast prevents TypeScript from incorrectly inferring
     * the Supabase insert argument as `never[]` when database
     * generated types are not installed.
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

    console.log(
      'Creating team member:',
      {
        ...teamMemberPayload,
        /*
         * Never log the password.
         */
      },
    );

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
        'Failed to create team_members record:',
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
         9. ROLLBACK AUTH USER
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
          'Failed to rollback Auth user:',
          rollbackError,
        );
      }

      return errorResponse(
        memberError.message ||
          'Failed to create the team member record.',
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
       11. FINAL ROLLBACK
    ======================================================== */

    if (
      createdAuthUserId
    ) {
      try {
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

    return errorResponse(
      error?.message ||
        'Failed to create team account.',
      500,
    );
  }
}