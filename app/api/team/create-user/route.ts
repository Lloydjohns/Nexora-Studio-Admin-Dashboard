import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

function cleanString(
  value: unknown,
  fallback = '',
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  const number = Number(value);

  if (
    Number.isNaN(number) ||
    !Number.isFinite(number)
  ) {
    return fallback;
  }

  return number;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const name =
      cleanString(body.name);

    const email =
      cleanString(body.email)
        .toLowerCase();

    const password =
      cleanString(body.password);

    const role =
      cleanString(
        body.role,
        'Team Member',
      );

    const availability =
      cleanString(
        body.availability,
        'Available',
      );

    const activeProjects =
      normalizeNumber(
        body.active_projects,
        0,
      );

    const tasksAssigned =
      normalizeNumber(
        body.tasks_assigned,
        0,
      );

    const tasksCompleted =
      normalizeNumber(
        body.tasks_completed,
        0,
      );

    const utilization =
      normalizeNumber(
        body.utilization,
        0,
      );

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

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 6 characters.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 1. Check whether this email already exists in Auth.
     * ---------------------------------------------------------
     */
    const {
      data: usersData,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(
        'Failed to check existing users:',
        usersError,
      );

      return NextResponse.json(
        {
          error:
            usersError.message,
        },
        {
          status: 500,
        },
      );
    }

    const existingUser =
      usersData.users.find(
        (user) =>
          user.email?.toLowerCase() ===
          email,
      );

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            'A user with this email already exists.',
        },
        {
          status: 409,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Create the real Supabase Auth account.
     * ---------------------------------------------------------
     */
    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
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

    const authUser =
      authData.user;

    if (!authUser) {
      return NextResponse.json(
        {
          error:
            'Supabase created the account but returned no user.',
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Create the Team Dashboard record.
     * ---------------------------------------------------------
     */
    const {
      data: teamMember,
      error: teamError,
    } =
      await supabaseAdmin
        .from('team_members')
        .insert({
          auth_user_id:
            authUser.id,

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

    /*
     * ---------------------------------------------------------
     * 4. Roll back Auth user if team record failed.
     * ---------------------------------------------------------
     */
    if (teamError) {
      console.error(
        'Failed to create team member:',
        teamError,
      );

      try {
        await supabaseAdmin.auth.admin.deleteUser(
          authUser.id,
        );
      } catch (rollbackError) {
        console.error(
          'Failed to roll back Auth user:',
          rollbackError,
        );
      }

      return NextResponse.json(
        {
          error:
            teamError.message,
          details:
            teamError.details,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        teamMember,
        user: {
          id: authUser.id,
          email: authUser.email,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      'Create team user error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create team user.',
      },
      {
        status: 500,
      },
    );
  }
}