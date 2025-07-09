import moment from "moment";
import { NextFunction, Request, Response } from "express";
import { format, subDays, isSameDay, differenceInDays, eachDayOfInterval } from "date-fns";

import prismaClient from "../../core/utils/prismadb";
import { HTTPSTATUS } from "../../config/http.config";
import { formatDateRange } from "../../core/utils/formatter";



export const summary = async (req: Request, res: Response, next: NextFunction) => {

  const { from: fromDate, to: toDate, type, user } = req.query;

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const from = fromDate
    ? moment(fromDate.toString(), "YYYY-MM-DD").toDate()
    : defaultFrom;
  const to = toDate
    ? moment(toDate.toString(), "YYYY-MM-DD").toDate()
    : defaultTo;

  //Get the number of full days between the end and start dates.
  const periodLenght = differenceInDays(to, from) + 1;

  //Last period date for data comparaison with current date
  const lastPeriodFrom = subDays(from, periodLenght);
  const lastPeriodTo = subDays(to, periodLenght);

  let currentPeriod;
  if (type && user && (type === 'createdBy' || type === 'assignTo')) {
    // Logique lorsque type est 'createdBy' ou 'assignTo'
    currentPeriod = await fetchSummaryData(from, to, type, user.toString());
  } else {
    // Gérer le cas où type n'est pas valide
    currentPeriod = await fetchSummaryData(from, to);
  }

  const group_transactions: any = await fetchSummaryGobalData(from, to);

  const group_transactions_by_region = group_transactions.per_region.map((item: { region: string; status: string; number: any; amount: any; }) => ({
    region: item.region,
    status: item.status,
    number: typeof item.number === 'bigint' ? Number(item.number) : item.number,
    amount: typeof item.amount === 'bigint' ? Number(item.amount) : item.amount,
  }));

  const group_transactions_by_unit = group_transactions.per_unit.map((item: { region: string; unit: string; status: string; number: any; amount: any; }) => ({
    region: item.region,
    unit: item.unit,
    status: item.status,
    number: typeof item.number === 'bigint' ? Number(item.number) : item.number,
    amount: typeof item.amount === 'bigint' ? Number(item.amount) : item.amount,
  }));

  const group_transactions_region = group_transactions.region.map((item: { region: string; number: any; amount: any; }) => ({
    name: item.region,
    value: typeof item.number === 'bigint' ? Number(item.number) : item.number,
  }));

  //const lastPeriod = await fetchSummaryData(from, to);
  // Convert BigInt to Number
  const formattedDaysData = currentPeriod.days.map(item => ({
    date: item.date,
    number: typeof item.number === 'bigint' ? Number(item.number) : item.number,
    amount: typeof item.number === 'bigint' ? Number(item.amount) : item.amount,
  }));

  const formattedTransactionsData = currentPeriod.transactions.map((item: { status: any; number: any; amount: any; }) => ({
    status: item.status,
    value: typeof item.number === 'bigint' ? Number(item.number) : item.number,
    amount: typeof item.number === 'bigint' ? Number(item.number) : item.number,
  })).reduce((acc: { [x: string]: any; }, curr: { status: string | number; value: any; }) => {
    acc[curr.status] = curr.value;
    return acc;
  }, {});


  const formattedCategoriesData = currentPeriod.transactions.map((item: { status: any; number: any; amount: any; }) => ({
    name: item.status,
    value: typeof item.number === 'bigint' ? Number(item.number) : item.number,
  }));
  return res.status(HTTPSTATUS.OK).json({
    success: true,
    data: {
      days: formattedDaysData,
      group: {
        by_region: group_transactions_by_region,
        by_unit: group_transactions_by_unit,

      },
      transactions: { nber: formattedTransactionsData },
      categories: { nber: formattedCategoriesData },
      regions: group_transactions_region,
      dateRangeLabel: formatDateRange({ from, to })
    }
  });

};

type FilterType = 'createdBy' | 'assignTo';

async function fetchSummaryData(from: Date, to: Date, type?: FilterType, userIdOrCreatedBy?: string) {
  const fromDate = format(from, "yyyy-MM-dd");
  const toDate = format(to, "yyyy-MM-dd");

  const filter =
    `${type === 'createdBy' && userIdOrCreatedBy ? `createdBy='${userIdOrCreatedBy}' AND ` : ''}${type === 'assignTo' && userIdOrCreatedBy ? `userId='${userIdOrCreatedBy}' AND ` : ''}`;

  // Requête pour les jours actifs
  const activeDaysQuery = `
    SELECT 
      DATE(paymentDate) AS date, 
      COUNT(*) AS count, 
      SUM(amount) AS amount
    FROM transactions
    WHERE 
      deleted = 0 AND 
      statusId <> 2 AND ${filter}
      paymentDate BETWEEN '${fromDate}' AND '${toDate}' 
    GROUP BY DATE(paymentDate) 
    ORDER BY date ASC
  `
  const activeDays: any = await prismaClient.$queryRawUnsafe(activeDaysQuery);

  const days = fillMissingDays(activeDays, from, to);

  // Requête pour les transactions
  const transactionsQuery = `
    SELECT 
      s.name AS status, 
      COUNT(*) AS number,
      SUM(t.amount) AS amount
    FROM 
      transactions t
    JOIN 
        status s ON t.statusId = s.id
    WHERE
        t.deleted = 0 AND
        statusId <> 2 AND ${filter}
        paymentDate BETWEEN '${fromDate}' AND '${toDate}'
    GROUP BY 
        t.statusId;
  `
  const transactions: any = await prismaClient.$queryRawUnsafe(transactionsQuery);

  return {
    days,
    transactions,
  };
}

async function fetchSummaryGobalData(from: Date, to: Date) {
  const fromDate = format(from, "yyyy-MM-dd");
  const toDate = format(to, "yyyy-MM-dd");

  const region_Query = `
  SELECT 
    r.name as region,
    COUNT(*) AS number,
    SUM(t.amount) AS amount
  FROM 
    transactions t
  JOIN 
      regions r ON t.regionId = r.id
  JOIN 
      status s ON t.statusId = s.id
  WHERE
      t.deleted = 0 AND
      t.statusId <> 2 AND 
      t.paymentDate BETWEEN '${fromDate}' AND '${toDate}'
  GROUP BY 
      t.regionId
  ORDER BY 
    r.name ASC;
`
  const region: any = await prismaClient.$queryRawUnsafe(region_Query);

  const transactions_per_region_Query = `
  SELECT 
    r.name as region,
    s.name AS status, 
    COUNT(*) AS number,
    SUM(t.amount) AS amount
  FROM 
    transactions t
  JOIN 
      regions r ON t.regionId = r.id
  JOIN 
      status s ON t.statusId = s.id
  WHERE
      t.deleted = 0 AND
      t.statusId <> 2 AND 
      t.paymentDate BETWEEN '${fromDate}' AND '${toDate}'
  GROUP BY 
      t.regionId,t.statusId
  ORDER BY 
    r.name ASC, s.name ASC;
`
  const per_region: any = await prismaClient.$queryRawUnsafe(transactions_per_region_Query);

  const transactions_per_unit_Query = `
  SELECT 
    r.name as region,
    u.name as unit,
    s.name AS status, 
    COUNT(*) AS number,
    SUM(t.amount) AS amount
  FROM 
    transactions t
  JOIN 
      units u ON t.unitId = u.id
  JOIN 
      regions r ON t.regionId = r.id
  JOIN 
      status s ON t.statusId = s.id
  WHERE
      t.deleted = 0 AND
      t.statusId <> 2 AND 
      t.paymentDate BETWEEN '${fromDate}' AND '${toDate}'
  GROUP BY 
     r.name, u.name, s.name
  ORDER BY 
    r.name ASC, u.name ASC, s.name ASC;
`
  const per_unit: any = await prismaClient.$queryRawUnsafe(transactions_per_unit_Query);

  return {
    region,
    per_region,
    per_unit
  };
}

function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function fillMissingDays(
  activeDays: { date: string; count: number; amount: number }[],
  startDate: Date,
  endDate: Date
): { date: Date; number: number; amount: number }[] {
  if (activeDays.length === 0) return [];
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    if (found) {
      return {
        date: day,
        number: found.count,
        amount: found.amount,
      };
    } else {
      return {
        date: day,
        number: 0,
        amount: 0,
      };
    }
  });

  return transactionsByDay;
}
