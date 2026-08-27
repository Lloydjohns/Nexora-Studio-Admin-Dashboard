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

export async function POST(request: Request) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Check that the person making the request is logged in.
     * ---------------------------------------------------------
     */
    const supabase = await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            'You must be signed in as an admin to create team accounts.',
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Read request body.
     * ---------------------------------------------------------
     */
    const body =
      (await request.json()) as CreateUserBody;

    const name =
      String(
        body.name ?? '',
      ).trim();

    const email =
      String(
        body.email ?? '',
      ).trim()
        .toLowerCase();

    const password =
      String(
        body.password ?? '',
      );

    const role =
      String(
        body.role ?? 'Designer',
      ).trim();

    const availability =
      String(
        body.availability ??
          'Available',
      ).trim();

    if (!name) {
      return NextResponse.json(
        {
          error:
            'Name is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            'Email is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error:
            'Password is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            'Password must contain at least 8 characters.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. IMPORTANT:
     *
     * Never trust a role sent by the browser for authorization.
     *
     * The current authenticated user must be authorized.
     *
     * For now, this uses ADMIN_EMAILS from .env.local.
     * ---------------------------------------------------------
     */
    const adminEmails =
      String(
        process.env.ADMIN_EMAILS ?? '',
      )
        .split(',')
        .map((value) =>
          value.trim().toLowerCase(),
        )
        .filter(Boolean);

    if (
      adminEmails.length > 0 &&
      !adminEmails.includes(
        String(
          user.email ?? '',
        ).toLowerCase(),
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Only authorized administrators can create team accounts.',
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Create SERVER-ONLY Supabase admin client.
     * ---------------------------------------------------------
     */
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        'Missing Supabase server environment variables.',
      );

      return NextResponse.json(
        {
          error:
            'Server Supabase configuration is missing.',
        },
        {
          status: 500,
        },
      );
    }

    const adminSupabase =
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
     * ---------------------------------------------------------
     * 5. Create the Auth account.
     *
     * email_confirm: true means the admin-created account can
     * sign in immediately without requiring email confirmation.
     * ---------------------------------------------------------
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
        'Failed to create auth user:',
        authError,
      );

      return NextResponse.json(
        {
          error:
            authError.message,
        },
        {
          status: 400,
        },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error:
            'Supabase created no user record.',
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 6. Create corresponding team_members record.
     * ---------------------------------------------------------
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
            Number(
              body.activeProjects ?? 0,
            ),
          tasks_assigned:
            Number(
              body.tasksAssigned ?? 0,
            ),
          tasks_completed:
            Number(
              body.tasksCompleted ?? 0,
            ),
          availability,
          utilization:
            Number(
              body.utilization ?? 50,
            ),
        })
        .select('*')
        .single();

    if (memberError) {
      /*
       * Roll back the Auth account if team_members insert fails.
       */
      await adminSupabase.auth.admin.deleteUser(
        authData.user.id,
      );

      console.error(
        'Failed to create team member:',
        memberError,
      );

      return NextResponse.json(
        {
          error:
            memberError.message,
        },
        {
          status: 400,
        },
      );
    }

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

    return NextResponse.json(
      {
        error:
          error?.message ??
          'Failed to create team account.',
      },
      {
        status: 500,
      },
    );
  }
}