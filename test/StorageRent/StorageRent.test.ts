import {
  calculateDiffBetweenWindow,
  calculateMonthlyRent,
  calculateProrate,
} from "../../src/StorageRent/StorageRent";
import {
  DEFAULT_ARRAY_MONTHLY_RECORDS_DECREASE_RENT,
  DEFAULT_ARRAY_MONTHLY_RECORDS_INCREASE_FREQUENCY,
  DEFAULT_ARRAY_MONTHLY_RECORDS_INCREASE_RENT,
  DEFAULT_ARRAY_MONTHLY_RECORDS_PRORATE,
  DEFAULT_ARRAY_MONTHLY_RECORDS_VACANCY,
  MOCK_MORE_MULTIPLE_SAME_YEAR_AND_DIFFERENT_MONTH,
  MOCK_MULTIPLE_MONTHS_RANGE_GREATER_ONE_YEAR,
  MOCK_MULTIPLE_MONTHS_RANGE_LESS_ONE_YEAR,
  MOCK_MULTIPLE_SAME_YEAR_AND_DIFFERENT_MONTH,
  MOCK_SAME_YEAR_AND_SAME_MONTH,
  ONLY_ONE_MONTH_RECORD,
} from "./mocks";

describe("calculateMonthlyRent function", () => {
  it("should return only one MonthlyRentRecords", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-01-01T00:00:00");
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-01-31T00:00:00");
    const dayOfMonthRentDue = 1;
    const rentRateChangeFrequency = 1;
    const rentChangeRate = 0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(ONLY_ONE_MONTH_RECORD);
  });
  it("should return MonthlyRentRecords", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-01-01T00:00:00");
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-03-31T00:00:00");
    const dayOfMonthRentDue = 1;
    const rentRateChangeFrequency = 1;
    const rentChangeRate = 0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(DEFAULT_ARRAY_MONTHLY_RECORDS_INCREASE_RENT);
  });
  it("should return MonthlyRentRecords with rentChangeRate < 0", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-01-01T00:00:00");
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-03-31T00:00:00");
    const dayOfMonthRentDue = 1;
    const rentRateChangeFrequency = 1;
    const rentChangeRate = -0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(DEFAULT_ARRAY_MONTHLY_RECORDS_DECREASE_RENT);
  });

  it("should return MonthlyRentRecords validate first payment due date and first month pro-rate when lease start is before monthly due date", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-01-01T00:00:00");
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-03-31T00:00:00");
    const dayOfMonthRentDue = 15;
    const rentRateChangeFrequency = 1;
    const rentChangeRate = 0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(DEFAULT_ARRAY_MONTHLY_RECORDS_PRORATE);
  });

  it("should return MonthlyRentRecords with increase frequency", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-03-15T00:00:00");
    const windowStartDate = new Date("2023-03-15T00:00:00");
    const windowEndDate = new Date("2023-07-31T00:00:00");
    const dayOfMonthRentDue = 1;
    const rentRateChangeFrequency = 2;
    const rentChangeRate = 0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(DEFAULT_ARRAY_MONTHLY_RECORDS_INCREASE_FREQUENCY);
  });

  it("should return MonthlyRentRecords with vacancy is true", () => {
    const baseMonthlyRent = 100.0;
    const leaseStartDate = new Date("2023-03-01T00:00:00");
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-05-31T00:00:00");
    const dayOfMonthRentDue = 1;
    const rentRateChangeFrequency = 1;
    const rentChangeRate = 0.1;

    const result = calculateMonthlyRent(
      baseMonthlyRent,
      leaseStartDate,
      windowStartDate,
      windowEndDate,
      dayOfMonthRentDue,
      rentRateChangeFrequency,
      rentChangeRate
    );

    expect(result).toEqual(DEFAULT_ARRAY_MONTHLY_RECORDS_VACANCY);
  });
});
describe("calculateDiffMonthly function", () => {
  it("should be return a correct number of months same year and same month", () => {
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-01-31T00:00:00");
    const result = calculateDiffBetweenWindow(windowStartDate, windowEndDate);
    expect(result).toStrictEqual(MOCK_SAME_YEAR_AND_SAME_MONTH);
  });
  it("should be return a correct number of months same year and same month", () => {
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-03-31T00:00:00");
    const result = calculateDiffBetweenWindow(windowStartDate, windowEndDate);
    expect(result).toStrictEqual(MOCK_MULTIPLE_SAME_YEAR_AND_DIFFERENT_MONTH);
  });
  it("should be return a correct number of months same year and different month", () => {
    const windowStartDate = new Date("2023-01-01T00:00:00");
    const windowEndDate = new Date("2023-04-30T00:00:00");
    const result = calculateDiffBetweenWindow(windowStartDate, windowEndDate);
    expect(result).toStrictEqual(
      MOCK_MORE_MULTIPLE_SAME_YEAR_AND_DIFFERENT_MONTH
    );
  });
  it("should be return a correct number of months different year and different month but in a range less then one year", () => {
    const windowStartDate = new Date("2023-11-01T00:00:00");
    const windowEndDate = new Date("2024-03-31T00:00:00");
    const result = calculateDiffBetweenWindow(windowStartDate, windowEndDate);
    expect(result).toStrictEqual(MOCK_MULTIPLE_MONTHS_RANGE_LESS_ONE_YEAR);
  });
  it("should be return a correct number of months different year and different month but in a range greater then one year", () => {
    const windowStartDate = new Date("2023-10-01T00:00:00");
    const windowEndDate = new Date("2025-03-31T00:00:00");
    const result = calculateDiffBetweenWindow(windowStartDate, windowEndDate);
    expect(result).toStrictEqual(MOCK_MULTIPLE_MONTHS_RANGE_GREATER_ONE_YEAR);
  });
});
describe("calculateProrate function", () => {
  it(" should return prorate ", () => {
    const leaseStartDate = new Date("2023-02-05T00:00:00");
    const dayOfMonthRentDue = 31;
    const baseMonthlyRent = 100;

    const result = calculateProrate({
      leaseStartDate,
      dayOfMonthRentDue,
      baseMonthlyRent,
    });
    const expectedResult = {
      rentAmount: 76.67,
      rentDueDate: new Date("2023-02-05T00:00:00"),
    };

    expect(result).toStrictEqual(expectedResult);
  });
  it(" test second option", () => {
    const leaseStartDate = new Date("2023-01-01T00:00:00");
    const dayOfMonthRentDue = 15;
    const baseMonthlyRent = 100;

    const result = calculateProrate({
      leaseStartDate,
      dayOfMonthRentDue,
      baseMonthlyRent,
    });
    const expectedResult = {
      rentAmount: 46.67,
      rentDueDate: leaseStartDate,
    };

    expect(result).toStrictEqual(expectedResult);
  });
  it(" test third option", () => {
    const leaseStartDate = new Date("2023-01-20T00:00:00");
    const dayOfMonthRentDue = 15;
    const baseMonthlyRent = 100;

    const result = calculateProrate({
      leaseStartDate,
      dayOfMonthRentDue,
      baseMonthlyRent,
    });
    const expectedResult = {
      rentAmount: 83.33,
      rentDueDate: leaseStartDate,
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
