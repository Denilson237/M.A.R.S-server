import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';

const prisma = new PrismaClient();

const typeData: Record<string, { label: string; value: string }[]> = {
  disconnect: [
    { label: "Impayée", value: "disconnect_unpaid_bill" },
    { label: "Résiliation", value: "disconnect_resiliation" },
    { label: "CNPC", value: "disconnect_cnpc" },
    { label: "Intervention technique", value: "disconnect_technical_intervention" },
  ],
  reconnect: [
    { label: "Règlement partiel de la dette", value: "reconnect_partial_bill_paid" },
    { label: "Règlement total de la dette", value: "reconnect_full_bill_paid" },
    { label: "Reprise d'abonnement", value: "reconnect_subscription" },
    { label: "Correction anomalie technique", value: "reconnect_technical_issue" },
  ],
};

export async function seed_ticketTypes() {
  const systemUser = await (new AuthService()).getUserSYSTEM();

  if (!systemUser) {
    console.error("❌ SYSTEM user not found.");
    return;
  }

  for (const [typeName, reasons] of Object.entries(typeData)) {
    const existingType = await prisma.ticketType.findUnique({ where: { name: typeName } });

    let ticketType;
    if (!existingType) {
      ticketType = await prisma.ticketType.create({
        data: {
          name: typeName,
          createdBy: systemUser.id,
          updatedBy: systemUser.id,
        },
      });
      console.log(`✅ Created ticket type: ${typeName}`);
    } else {
      ticketType = existingType;
      console.log(`ℹ️ Ticket type already exists: ${typeName}`);
    }

    for (const reason of reasons) {
      const existingReason = await prisma.ticketTypeReason.findFirst({
        where: { name: reason.value },
      });

      if (!existingReason) {
        await prisma.ticketTypeReason.create({
          data: {
            name: reason.value,
            description: reason.label,
            TicketTypeId: ticketType.id,
            createdBy: systemUser.id,
            updatedBy: systemUser.id,
          },
        });
        console.log(`  → Created reason: ${reason.label} (${reason.value})`);
      } else {
        console.log(`  → Reason already exists: ${reason.label} (${reason.value})`);
      }
    }
  }

  console.log("🎉 Ticket types and reasons seeded successfully.");
}
