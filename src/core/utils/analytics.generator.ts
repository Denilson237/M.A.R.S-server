import prismaClient from "./prismadb";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MonthsData() {
  const last12Months: MonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );

    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 28
    );

    const monthYear = endDate.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const count = await prismaClient.ticket.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    last12Months.push({ month:monthYear, count });
  }
  return { last12Months };
}
