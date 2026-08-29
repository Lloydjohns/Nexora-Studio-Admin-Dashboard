import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

function cleanString(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}

function normalizeNumber(
  value: unknown,
): number {
  const number = Number(value);

  if (
    Number.isNaN(number) ||
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return number;
}

/* ============================================================
   UPDATE TEAM MEMBER
============================================================ */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const {
      id,
    } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            'Team member ID is required.',
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    const updatePayload: Record<
      string,
      unknown
    > = {};

    if (
      'name' in body
    ) {
      updatePayload.name =
        cleanString(
          body.name,
        );
    }

    if (
      'role' in body
    ) {
      updatePayload.role =
        cleanString(
          body.role,
        );
    }

    if (
      'email' in body
    ) {
      updatePayload.email =
        cleanString(
          body.email,
        ).toLowerCase();
    }

    if (
      'active_projects' in body
    ) {
      updatePayload.active_projects =
        normalizeNumber(
          body.active_projects,
        );
    }

    if (
      'tasks_assigned' in body
    ) {
      updatePayload.tasks_assigned =
        normalizeNumber(
          body.tasks_assigned,
        );
    }

    if (
      'tasks_completed' in body
    ) {
      updatePayload.tasks_completed =
        normalizeNumber(
          body.tasks_completed,
        );
    }

    if (
      'availability' in body
    ) {
      updatePayload.availability =
        cleanString(
          body.availability,
        );
    }

    if (
      'utilization' in body
    ) {
      updatePayload.utilization =
        normalizeNumber(
          body.utilization,
        );
    }

    if (
      'avatar' in body
    ) {
      updatePayload.avatar =
        body.avatar;
    }

    if (
      Object.keys(
        updatePayload,
      ).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'No fields were provided for update.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * First retrieve the existing team member.
     */
    const {
      data: existingMember,
      error:
        existingMemberError,
    } =
      await supabaseAdmin
        .from('team_members')
        .select('*')
        .eq(
          'id',
          id,
        )
        .single();

    if (
      existingMemberError
    ) {
      return NextResponse.json(
        {
          error:
            existingMemberError.message,
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Update Team Dashboard record.
     */
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from('team_members')
        .update(
          updatePayload,
        )
        .eq(
          'id',
          id,
        )
        .select('*')
        .single();

    if (error) {
      console.error(
        'Failed to update team member:',
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * If email was changed, update Supabase Auth too.
     */
    if (
      'email' in body &&
      existingMember.auth_user_id
    ) {
      const newEmail =
        cleanString(
          body.email,
        ).toLowerCase();

      if (newEmail) {
        const {
          error:
            authEmailError,
        } =
          await supabaseAdmin.auth.admin.updateUserById(
            existingMember.auth_user_id,
            {
              email:
                newEmail,
              email_confirm:
                true,
            },
          );

        if (
          authEmailError
        ) {
          console.error(
            'Failed to update Auth email:',
            authEmailError,
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        teamMember: data,
      },
    );
  } catch (error) {
    console.error(
      'Update team member error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update team member.',
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   DELETE TEAM MEMBER
============================================================ */

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const {
      id,
    } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            'Team member ID is required.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Find the team member first so we can
     * retrieve the Auth user ID.
     */
    const {
      data: member,
      error:
        memberError,
    } =
      await supabaseAdmin
        .from('team_members')
        .select(
          'id, auth_user_id',
        )
        .eq(
          'id',
          id,
        )
        .single();

    if (
      memberError ||
      !member
    ) {
      return NextResponse.json(
        {
          error:
            memberError?.message ??
            'Team member not found.',
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Delete dashboard record first.
     */
    const {
      error:
        deleteTeamError,
    } =
      await supabaseAdmin
        .from('team_members')
        .delete()
        .eq(
          'id',
          id,
        );

    if (
      deleteTeamError
    ) {
      console.error(
        'Failed to delete team member:',
        deleteTeamError,
      );

      return NextResponse.json(
        {
          error:
            deleteTeamError.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Then delete the actual Auth account.
     */
    if (
      member.auth_user_id
    ) {
      const {
        error:
          authDeleteError,
      } =
        await supabaseAdmin.auth.admin.deleteUser(
          member.auth_user_id,
        );

      if (
        authDeleteError
      ) {
        console.error(
          'Team member removed but Auth user could not be deleted:',
          authDeleteError,
        );

        return NextResponse.json(
          {
            success: true,
            warning:
              'Team member deleted, but the authentication account could not be removed.',
          },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
      },
    );
  } catch (error) {
    console.error(
      'Delete team member error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete team member.',
      },
      {
        status: 500,
      },
    );
  }
}