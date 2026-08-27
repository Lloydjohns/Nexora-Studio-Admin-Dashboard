import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}

export async function POST(request: Request) {
  let createdAuthUserId: string | null = null;
  let adminSupabase:
    | ReturnType<typeof createAdminClient>
    | null = null;

  try {
    /*
     * ========================================================
     * 1. CHECK CURRENT SESSION
     * ========================================================
     *
     * Only an already authenticated user may call this route.
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        'Failed to read current Supabase user:',
        userError,
      );

      return jsonError(
        'Unable to verify your current session.',
        401,
      );
    }

    if (!user) {
      return jsonError(
        'You must be signed in as an administrator to create team accounts.',
        401,
      );
    }

    /*
     * ========================================================
     * 2. VERIFY ADMIN ACCESS
     * ========================================================
     *
     * ADMIN_EMAILS should contain one or more approved
     * administrator emails separated by commas.
     *
     * Example:
     *
     * ADMIN_EMAILS=admin@nexorastudio.ph,owner@nexorastudio.ph
     *
     * IMPORTANT:
     * The role submitted by the browser is NOT used to decide
     * whether the current user is an administrator.
     */
    const adminEmails = String(
      process.env.ADMIN_EMAILS ?? '',
    )
      .split(',')
      .map((email) =>
        email.trim().toLowerCase(),
      )
      .filter(Boolean);

    const currentUserEmail = String(
      user.email ?? '',
    )
      .trim()
      .toLowerCase();

    if (adminEmails.length === 0) {
      console.error(
        'ADMIN_EMAILS environment variable is missing or empty.',
      );

      return jsonError(
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

      return jsonError(
        'Only authorized administrators can create team accounts.',
        403,
      );
    }

    /*
     * ========================================================
     * 3. READ REQUEST BODY
     * ========================================================
     */
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

    const name = String(
      body.name ?? '',
    ).trim();

    const email = String(
      body.email ?? '',
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password ?? '',
    );

    const role = String(
      body.role ?? 'Admin',
    ).trim();

    const availability = String(
      body.availability ?? 'Available',
    ).trim();

    const activeProjects = Math.max(
      0,
      Number(
        body.activeProjects ?? 0,
      ) || 0,
    );

    const tasksAssigned = Math.max(
      0,
      Number(
        body.tasksAssigned ?? 0,
      ) || 0,
    );

    const tasksCompleted = Math.max(
      0,
      Number(
        body.tasksCompleted ?? 0,
      ) || 0,
    );

    const utilization = Math.min(
      100,
      Math.max(
        0,
        Number(
          body.utilization ?? 50,
        ) || 0,
      ),
    );

    /*
     * ========================================================
     * 4. VALIDATE INPUT
     * ========================================================
     */
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

    /*
     * Basic email validation.
     */
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return jsonError(
        'Please provide a valid email address.',
        400,
      );
    }

    if (!password) {
      return jsonError(
        'Password is required.',
        400,
      );
    }

    if (password.length < 8) {
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

    /*
     * ========================================================
     * 5. VERIFY SERVER ENVIRONMENT
     * ========================================================
     *
     * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
     */
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error(
        'Missing NEXT_PUBLIC_SUPABASE_URL on server.',
      );

      return jsonError(
        'Server Supabase configuration is missing: NEXT_PUBLIC_SUPABASE_URL.',
        500,
      );
    }

    if (!serviceRoleKey) {
      console.error(
        'Missing SUPABASE_SERVICE_ROLE_KEY on server.',
      );

      return jsonError(
        'Server Supabase configuration is missing: SUPABASE_SERVICE_ROLE_KEY.',
        500,
      );
    }

    /*
     * ========================================================
     * 6. CREATE SERVER-ONLY ADMIN CLIENT
     * ========================================================
     */
    adminSupabase =
      createAdminClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    /*
     * ========================================================
     * 7. CHECK FOR EXISTING EMAIL
     * ========================================================
     *
     * Supabase Auth will also reject duplicate emails, but this
     * gives the UI a cleaner error before creating anything.
     */
    let existingUserFound = false;

    try {
      const {
        data: usersData,
        error: usersError,
      } =
        await adminSupabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (!usersError) {
        existingUserFound =
          usersData.users.some(
            (existingUser) =>
              String(
                existingUser.email ?? '',
              )
                .trim()
                .toLowerCase() === email,
          );
      }
    } catch (error) {
      /*
       * If the duplicate check fails, continue and allow
       * Supabase Auth itself to determine whether the email
       * already exists.
       */
      console.warn(
        'Could not perform duplicate email pre-check:',
        error,
      );
    }

    if (existingUserFound) {
      return jsonError(
        'An Auth account with this email already exists.',
        409,
      );
    }

    /*
     * ========================================================
     * 8. CREATE SUPABASE AUTH USER
     * ========================================================
     *
     * email_confirm: true
     *
     * means the team member can sign in immediately using the
     * password created by the administrator.
     */
    const {
      data: authData,
      error: authError,
    } =
      await adminSupabase.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
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
          'Failed to create the authentication account.',
        400,
      );
    }

    if (!authData.user) {
      return jsonError(
        'Supabase did not return the created user.',
        500,
      );
    }

    createdAuthUserId =
      authData.user.id;

    /*
     * ========================================================
     * 9. CREATE TEAM MEMBER RECORD
     * ========================================================
     *
     * The Auth account and team_members record are intentionally
     * created together.
     */
    const {
      data: member,
      error: memberError,
    } =
      await adminSupabase
        .from('team_members')
        .insert({
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
        })
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

      /*
       * ------------------------------------------------------
       * ROLLBACK AUTH ACCOUNT
       * ------------------------------------------------------
       *
       * We do not want an Auth account without a corresponding
       * team member record.
       */
      try {
        await adminSupabase.auth.admin.deleteUser(
          authData.user.id,
        );
      } catch (rollbackError) {
        console.error(
          'Failed to rollback Auth user after team member insert failed:',
          rollbackError,
        );
      }

      createdAuthUserId = null;

      return jsonError(
        memberError.message ||
          'Failed to create the team member record.',
        400,
      );
    }

    /*
     * ========================================================
     * 10. SUCCESS
     * ========================================================
     */
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
      'Create team account route error:',
      error,
    );

    /*
     * ========================================================
     * SAFETY ROLLBACK
     * ========================================================
     *
     * If something unexpected happens after Auth creation,
     * remove the orphaned Auth user.
     */
    if (
      createdAuthUserId &&
      adminSupabase
    ) {
      try {
        await adminSupabase.auth.admin.deleteUser(
          createdAuthUserId,
        );
      } catch (rollbackError) {
        console.error(
          'Unexpected-error rollback failed:',
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