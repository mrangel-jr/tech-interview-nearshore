export type MonthlyRentRecord = {
  vacancy: boolean;
  rentAmount: number;
  rentDueDate: Date;
};

export type RentContract = {
  baseMonthlyRent: number;
  leaseStartDate: Date;
  windowStartDate: Date;
  windowEndDate: Date;
  dayOfMonthRentDue: number;
  rentRateChangeFrequency: number;
  rentChangeRate: number;
};

export type ResultRent = {
  rentAmount: number;
  rentDueDate: Date;
};

type DateInfo = {
  day: number;
  month: number;
  year: number;
};

export type InputRentCalc = {
  dayOfMonthRentDue: number;
  baseMonthlyRent: number;
  period: DateInfo;
  rentRateChangeFrequency: number;
  rentChangeRate?: number;
  countOfFrequency?: number;
};

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

/**
 * Determines the vacancy, rent amount and due date for each month in a given time window
 *
 * @param baseMonthlyRent : The base or starting monthly rent for unit (Number)
 * @param leaseStartDate : The date that the tenant's lease starts (Date)
 * @param windowStartDate : The first date of the given time window (Date)
 * @param windowEndDate : The last date of the given time window (Date)
 * @param dayOfMonthRentDue : The day of each month on which rent is due (Number)
 * @param rentRateChangeFrequency : The frequency in months the rent is changed (Number)
 * @param rentChangeRate : The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number),
 * @returns Array<MonthlyRentRecord>;
 */
export function calculateMonthlyRent(
  baseMonthlyRent: number,
  leaseStartDate: Date,
  windowStartDate: Date,
  windowEndDate: Date,
  dayOfMonthRentDue: number,
  rentRateChangeFrequency: number,
  rentChangeRate: number
) {
  const monthlyRentRecords: MonthlyRentRecords = [];
  const monthsOfWindow = calculateDiffBetweenWindow(
    windowStartDate,
    windowEndDate
  );
  let baseRent = baseMonthlyRent;
  let isFirstMonth = true;
  let countOfFrequency = 0;
  let isOccupied = false;
  for (let i = 0; i < monthsOfWindow.length; i++) {
    isOccupied = checkIfLeaseStartDateInMonth(
      leaseStartDate,
      monthsOfWindow[0],
      monthsOfWindow[i]
    );
    if (!isOccupied) {
      const dueDate = new Date(
        monthsOfWindow[i].year,
        monthsOfWindow[i].month - 1,
        1
      );
      addRentRecord({
        monthlyRentRecords,
        vacancy: !isOccupied,
        rentAmount: formatRentValue(baseMonthlyRent),
        rentDueDate: dueDate,
      });
    } else {
      if (isFirstMonth) {
        isFirstMonth &&
          calculateFirstMonth({
            leaseStartDate,
            dayOfMonthRentDue,
            baseMonthlyRent,
            monthlyRentRecords,
            isOccupied,
            monthOfWindowRange: monthsOfWindow[i],
            rentRateChangeFrequency,
          });
        isFirstMonth = false;
      } else {
        countOfFrequency++;
        const rent = calculateRent({
          dayOfMonthRentDue,
          baseMonthlyRent: baseRent,
          period: monthsOfWindow[i],
          rentRateChangeFrequency,
          rentChangeRate,
          countOfFrequency,
        });
        addRentRecord({
          monthlyRentRecords,
          vacancy: !isOccupied,
          rentAmount: rent.rentAmount,
          rentDueDate: rent.rentDueDate,
        });
        baseRent = rent.rentAmount;
      }
    }
  }
  return monthlyRentRecords;
}

/**
 * Calculates the new monthly rent
 *
 * @param baseMonthlyRent : the base amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 *
 */
function calculateNewMonthlyRent(
  baseMonthlyRent: number,
  rentChangeRate: number
) {
  return baseMonthlyRent * (1 + rentChangeRate);
}

/**
 * Determines if the year is a leap year
 *
 * @param year
 * @returns boolean
 *
 */
function isLeapYear(year: number) {
  return year % 4 == 0 && year % 100 != 0;
}

function getLastDayOfMonth(month: number, year: number): number {
  if (month < 0 || month > 12) {
    throw new Error("Invalid month");
  }
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
    return 31;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return isLeapYear(year) ? 29 : 28;
}

export function calculateDiffBetweenWindow(
  startDate: Date,
  endDate: Date
): DateInfo[] {
  const years = endDate.getFullYear() - startDate.getFullYear();
  if (years < 0) {
    throw new Error("Invalid window slot");
  }
  let rangeData: DateInfo[] = [];
  let initData = {
    year: startDate.getFullYear(),
    month: startDate.getMonth(),
  };
  if (
    endDate.getFullYear() === startDate.getFullYear() &&
    endDate.getMonth() === startDate.getMonth()
  ) {
    return [
      {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: getLastDayOfMonth(
          startDate.getMonth() + 1,
          startDate.getFullYear()
        ),
      },
    ];
  }
  const months =
    endDate.getFullYear() - initData.year === 0
      ? endDate.getMonth() - initData.month + 1
      : 12 - initData.month + endDate.getMonth() + 1 + (years - 1) * 12;
  for (let i = 0; i < months; i++) {
    rangeData.push({
      year: initData.year,
      month: initData.month + 1,
      day: getLastDayOfMonth(initData.month + 1, initData.year),
    });
    initData.month++;
    if (initData.month > 11) {
      initData.month = 0;
      initData.year++;
    }
  }
  return rangeData;
}

export function calculateProrate({
  leaseStartDate,
  baseMonthlyRent,
  dayOfMonthRentDue,
}: {
  leaseStartDate: Date;
  baseMonthlyRent: number;
  dayOfMonthRentDue: number;
}): ResultRent {
  const initLeaseDay = leaseStartDate.getDate();
  if (initLeaseDay === dayOfMonthRentDue) {
    return { rentAmount: baseMonthlyRent, rentDueDate: leaseStartDate };
  }
  const prorate =
    dayOfMonthRentDue > initLeaseDay
      ? (baseMonthlyRent *
          (Math.min(
            dayOfMonthRentDue,
            getLastDayOfMonth(
              leaseStartDate.getMonth() + 1,
              leaseStartDate.getFullYear()
            )
          ) -
            initLeaseDay)) /
        30
      : baseMonthlyRent * (1 - (initLeaseDay - dayOfMonthRentDue) / 30);
  return {
    rentAmount: formatRentValue(prorate),
    rentDueDate: new Date(
      leaseStartDate.getFullYear(),
      leaseStartDate.getMonth(),
      initLeaseDay
    ),
  };
}

export function checkIfLeaseStartDateInMonth(
  leaseStartDate: Date,
  startPeriod: DateInfo,
  endPeriod: DateInfo
): boolean {
  const startDate = new Date(startPeriod.year, startPeriod.month - 1, 1);
  const endDate = new Date(endPeriod.year, endPeriod.month - 1, endPeriod.day);
  return leaseStartDate >= startDate && leaseStartDate <= endDate;
}

export function calculateRent({
  dayOfMonthRentDue,
  baseMonthlyRent,
  period,
  rentRateChangeFrequency,
  rentChangeRate = 0,
  countOfFrequency = 0,
}: InputRentCalc): ResultRent {
  const updateRentChangeRate =
    countOfFrequency % rentRateChangeFrequency === 0 ? rentChangeRate : 0;
  return {
    rentAmount: formatRentValue(
      calculateNewMonthlyRent(baseMonthlyRent, updateRentChangeRate)
    ),
    rentDueDate: new Date(period.year, period.month - 1, dayOfMonthRentDue),
  };
}

function formatRentValue(value: number): number {
  return Number(value.toFixed(2));
}

function addRentRecord({
  monthlyRentRecords,
  vacancy,
  rentAmount,
  rentDueDate,
}: {
  monthlyRentRecords: MonthlyRentRecords;
  vacancy: boolean;
  rentAmount: number;
  rentDueDate: Date;
}): void {
  monthlyRentRecords.push({
    vacancy,
    rentAmount,
    rentDueDate,
  });
}

function calculateFirstMonth({
  leaseStartDate,
  dayOfMonthRentDue,
  baseMonthlyRent,
  monthlyRentRecords,
  isOccupied,
  monthOfWindowRange,
  rentRateChangeFrequency,
}: {
  leaseStartDate: Date;
  dayOfMonthRentDue: number;
  baseMonthlyRent: number;
  monthlyRentRecords: MonthlyRentRecords;
  isOccupied: boolean;
  monthOfWindowRange: DateInfo;
  rentRateChangeFrequency: number;
}): void {
  const prorate = calculateProrate({
    leaseStartDate,
    dayOfMonthRentDue,
    baseMonthlyRent,
  });
  const { rentAmount, rentDueDate } = prorate;
  addRentRecord({
    monthlyRentRecords,
    vacancy: !isOccupied,
    rentAmount,
    rentDueDate,
  });

  if (dayOfMonthRentDue > leaseStartDate.getDate()) {
    const rent = calculateRent({
      dayOfMonthRentDue,
      baseMonthlyRent: baseMonthlyRent,
      period: monthOfWindowRange,
      rentRateChangeFrequency,
    });
    const { rentAmount, rentDueDate } = rent;
    addRentRecord({
      monthlyRentRecords,
      vacancy: !isOccupied,
      rentAmount,
      rentDueDate,
    });
  }
}
