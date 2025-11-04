import { PrismaClient, Frequency, Client, RuleCondition } from '@/lib/generated/prisma-client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

function matchesAllConditions(client: Client, conditions: RuleCondition[]): boolean {
  return conditions.every((c) => {
    switch (c.operator) {
      case 'EQUALS':
        return (client as unknown as Record<string, unknown>)[c.field] === c.value;
      case 'IN':
        return c.value.split(',').includes(String((client as unknown as Record<string, unknown>)[c.field]));
      case 'IS_TRUE':
        return Boolean((client as unknown as Record<string, unknown>)[c.field]);
      default:
        return false;
    }
  });
}

export async function POST(request: Request) {
  try {
    const { frequency } = await request.json();

    if (!frequency || !Object.values(Frequency).includes(frequency)) {
      return NextResponse.json({ error: 'Invalid or missing frequency parameter' }, { status: 400 });
    }

    // Fetch active rules with the specified frequency
    const rules = await prisma.rule.findMany({
      where: {
        frequency,
        active: true,
      },
      include: {
        conditions: true,
      },
    });

    if (rules.length === 0) {
      return NextResponse.json({ message: 'No rules found for the specified frequency.' });
    }

    // Generate tasks based on rules
    const tasks = [];
    for (const rule of rules) {
      const clients = await prisma.client.findMany();

      for (const client of clients) {
        if (matchesAllConditions(client, rule.conditions)) {
          // Fetch users of type USER assigned to the client
          const assignedUsers = await prisma.userClient.findMany({
            where: {
              clientId: client.id,
              user: {
                rol: 'USER',
              },
            },
            include: {
              user: true,
            },
          });

          for (const { user } of assignedUsers) {
            const task = await prisma.task.create({
              data: {
                title: rule.taskTitle,
                notes: rule.taskNotes,
                date: new Date(),
                clientId: client.id,
                userId: user.id, // Assign task to the user
              },
            });
            tasks.push(task);
          }
        }
      }
    }

    return NextResponse.json({ message: 'Tasks generated successfully', tasks });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}